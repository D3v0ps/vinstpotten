-- Admin payment tool — generates Stripe payment links from a reg/deltagar-ID
-- and tracks payment status. Two email modes:
--   1. payment_link        — info-mejl + unique Stripe link
--   2. payment_confirmation — bekräftelsemejl (Stripe ej krävs)
--
-- Apply with: supabase migration up   (or paste in the Supabase SQL editor)

-- ─────────────────────────────────────────────────────────────
-- payment_links — one row per Stripe checkout link the admin generates
-- ─────────────────────────────────────────────────────────────
create table if not exists public.payment_links (
  id uuid primary key default uuid_generate_v4(),
  -- The reg/deltagar-ID that the admin pasted in. Keep flexible (text)
  -- so it can match orders.id, sellers.id, or an external system.
  reference_id text not null,
  -- Snapshot of the recipient at send-time (so the email log is stable
  -- even if the underlying order/seller is later edited).
  recipient_email text not null,
  recipient_name text,
  recipient_phone text,
  amount_sek integer not null check (amount_sek > 0),
  currency text not null default 'sek',
  description text,
  -- Stripe
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  stripe_url text,
  -- Lifecycle
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'cancelled', 'failed')),
  paid_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users on delete set null
);

create index if not exists payment_links_reference_idx on public.payment_links (reference_id);
create index if not exists payment_links_status_idx on public.payment_links (status);
create index if not exists payment_links_session_idx on public.payment_links (stripe_session_id);

alter table public.payment_links enable row level security;

-- Admin-only access. Profiles already has a 'role' column with 'admin' check.
create policy "payment_links_admin_select"
  on public.payment_links for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "payment_links_admin_insert"
  on public.payment_links for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "payment_links_admin_update"
  on public.payment_links for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- email_log — every mail the admin tool sends
-- ─────────────────────────────────────────────────────────────
create table if not exists public.email_log (
  id uuid primary key default uuid_generate_v4(),
  template text not null check (template in ('payment_link', 'payment_confirmation')),
  reference_id text,
  payment_link_id uuid references public.payment_links on delete set null,
  recipient_email text not null,
  recipient_name text,
  subject text,
  body_html text,
  body_text text,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed')),
  provider text,
  provider_message_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users on delete set null
);

create index if not exists email_log_reference_idx on public.email_log (reference_id);
create index if not exists email_log_payment_link_idx on public.email_log (payment_link_id);

alter table public.email_log enable row level security;

create policy "email_log_admin_select"
  on public.email_log for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "email_log_admin_insert"
  on public.email_log for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "email_log_admin_update"
  on public.email_log for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- is_admin() helper — used by edge functions and the client
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;


-- ─────────────────────────────────────────────────────────────
-- lookup_reference(id) — resolves a reg/deltagar-ID to recipient info.
-- Tries orders first, then sellers (joined to its order for contact data).
-- Returns null fields when no match, so the admin can still type values
-- in manually.
-- ─────────────────────────────────────────────────────────────
create or replace function public.lookup_reference(ref text)
returns table (
  source text,
  reference_id text,
  recipient_name text,
  recipient_email text,
  recipient_phone text,
  group_name text,
  total_shirts integer,
  estimated_revenue integer,
  estimated_profit integer
)
language sql security definer stable as $$
  -- Match an order by full UUID.
  select
    'order'::text as source,
    o.id::text as reference_id,
    o.contact_name as recipient_name,
    o.email as recipient_email,
    o.phone as recipient_phone,
    o.group_name,
    o.total_shirts,
    o.estimated_revenue,
    o.estimated_profit
  from public.orders o
  where o.id::text = ref
  union all
  -- Match a seller by full UUID and pull contact info from the parent order.
  select
    'seller'::text as source,
    s.id::text as reference_id,
    coalesce(s.display_name, o.contact_name) as recipient_name,
    o.email as recipient_email,
    o.phone as recipient_phone,
    o.group_name,
    o.total_shirts,
    o.estimated_revenue,
    o.estimated_profit
  from public.sellers s
  join public.orders o on o.id = s.order_id
  where s.id::text = ref
  limit 1;
$$;

grant execute on function public.lookup_reference(text) to authenticated;
