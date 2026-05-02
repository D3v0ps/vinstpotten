-- Vinstpotten initial schema.
-- Apply with: supabase migration up   (or paste in the Supabase SQL editor)
--
-- Tables:
--   profiles              — public profile linked to auth.users
--   orders                — startpaket-orders submitted from /bestall
--   sellers               — individual sellers within an order (one per student)
--   sales                 — individual shirt sales attributed to sellers
--   collections           — t-shirt SKUs (Klass-edition, Lag-edition, etc.)
--
-- Row level security is enabled everywhere. Default deny.

-- ─────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ─────────────────────────────────────────────────────────────
-- profiles — extends auth.users with role + display name
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'seller', 'admin')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────
-- collections — the SKU catalogue
-- ─────────────────────────────────────────────────────────────
create table if not exists public.collections (
  slug text primary key,
  name text not null,
  description text,
  price_sek integer not null default 249,
  cost_sek integer not null default 95,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;

create policy "collections_public_read"
  on public.collections for select
  using (active = true);


-- ─────────────────────────────────────────────────────────────
-- orders — a campaign for one group
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete set null,
  -- group
  group_name text not null,
  group_type text not null check (group_type in ('klass', 'lag', 'forening')),
  goal text,
  sellers integer not null check (sellers >= 5 and sellers <= 200),
  shirts_per_seller integer not null check (shirts_per_seller >= 2 and shirts_per_seller <= 30),
  total_shirts integer generated always as (sellers * shirts_per_seller) stored,
  collection_slug text references public.collections(slug),
  -- contact
  contact_name text not null,
  contact_role text,
  email text not null,
  phone text not null,
  address text,
  postal text,
  city text,
  -- estimate snapshot at submit time
  estimated_revenue integer not null default 0,
  estimated_profit integer not null default 0,
  -- lifecycle
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'paid', 'shipped', 'selling', 'completed', 'cancelled')),
  shirts_sold integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Allow anyone (anon) to insert via the public order form. We require that the
-- email and contact details are populated; backend triggers can attach user_id
-- once they sign in with the same email.
create policy "orders_anon_insert"
  on public.orders for insert
  to anon, authenticated
  with check (
    email is not null
    and contact_name is not null
    and group_name is not null
  );

-- Owners (matching email) can read their own orders.
create policy "orders_owner_read"
  on public.orders for select
  to authenticated
  using (
    email = (select email from auth.users where id = auth.uid())
    or user_id = auth.uid()
  );

create policy "orders_owner_update"
  on public.orders for update
  to authenticated
  using (
    email = (select email from auth.users where id = auth.uid())
    or user_id = auth.uid()
  );


-- ─────────────────────────────────────────────────────────────
-- sellers — one row per kid in the campaign
-- ─────────────────────────────────────────────────────────────
create table if not exists public.sellers (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders on delete cascade,
  display_name text not null,
  qr_token text unique not null default replace(uuid_generate_v4()::text, '-', ''),
  shirts_sold integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sellers enable row level security;

-- Public read by qr_token only (used by the seller's own QR page).
create policy "sellers_public_read_by_token"
  on public.sellers for select
  using (true);

-- Order owners can manage their sellers.
create policy "sellers_owner_manage"
  on public.sellers for all
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = sellers.order_id
        and (o.user_id = auth.uid() or o.email = (select email from auth.users where id = auth.uid()))
    )
  );


-- ─────────────────────────────────────────────────────────────
-- sales — individual shirt sales
-- ─────────────────────────────────────────────────────────────
create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.sellers on delete cascade,
  buyer_name text,
  buyer_contact text,
  size text check (size in ('S', 'M', 'L', 'XL', 'XXL')),
  paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.sales enable row level security;

-- Sellers / buyers add via the public QR-page (they pass their seller's qr_token).
create policy "sales_public_insert"
  on public.sales for insert
  with check (true);

-- Owners can read sales for their own orders.
create policy "sales_owner_read"
  on public.sales for select
  to authenticated
  using (
    exists (
      select 1 from public.sellers s
      join public.orders o on o.id = s.order_id
      where s.id = sales.seller_id
        and (o.user_id = auth.uid() or o.email = (select email from auth.users where id = auth.uid()))
    )
  );


-- ─────────────────────────────────────────────────────────────
-- triggers — bookkeeping
-- ─────────────────────────────────────────────────────────────
create or replace function public.tg_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at
  before update on public.orders
  for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();


-- Keep order.shirts_sold in sync with sales aggregate.
create or replace function public.tg_recalc_order_sold() returns trigger
language plpgsql as $$
declare
  oid uuid;
begin
  select s.order_id into oid
  from public.sellers s
  where s.id = coalesce(new.seller_id, old.seller_id);

  update public.orders o
  set shirts_sold = (
    select count(*)
    from public.sales sa
    join public.sellers sl on sl.id = sa.seller_id
    where sl.order_id = oid
      and sa.paid = true
  )
  where o.id = oid;

  return null;
end;
$$;

drop trigger if exists recalc_order_sold on public.sales;
create trigger recalc_order_sold
  after insert or update or delete on public.sales
  for each row execute function public.tg_recalc_order_sold();


-- ─────────────────────────────────────────────────────────────
-- seed — initial collections from the design
-- ─────────────────────────────────────────────────────────────
insert into public.collections (slug, name, description) values
  ('klass-edition', 'Klass-edition', 'Klassisk t-shirt med tryck på framsidan.'),
  ('lag-edition', 'Lag-edition', 'Plommon-tröja för lag.'),
  ('forenings-edition', 'Förenings-edition', 'För föreningar.'),
  ('studentbal', 'Studentbal', 'Studentbal-edition.'),
  ('cup-edition', 'Cup-edition', 'För cuplag.'),
  ('skolavslutning', 'Skolavslutning', 'Mjuk och tjock kvalitet.')
on conflict (slug) do nothing;
