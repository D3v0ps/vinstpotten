// Auth helpers — kontrollerar att den som anropar är en admin.
//
// Edge functions får request-headern `Authorization: Bearer <jwt>` av
// supabase-js automatiskt när du anropar via supabase.functions.invoke().
// Vi använder den för att skapa en user-scoped supabase-klient och
// kollar 'profiles.role = admin'.

// @ts-ignore — Deno-only import, ignoreras av tsc i src
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export interface AdminContext {
  userId: string;
  email: string | null;
  client: SupabaseClient;
  serviceClient: SupabaseClient;
}

export async function requireAdmin(req: Request): Promise<AdminContext> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Error('Saknar Authorization-header');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) {
    throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY saknas');
  }

  // User-scoped client — RLS gäller, auth.uid() = den inloggade.
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Service-role client — för att skriva email_log/payment_links med
  // garanterad åtkomst även om RLS skulle ändras.
  const serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('Ogiltig session');

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();
  if (profileError || profile?.role !== 'admin') {
    throw new Error('Endast admin-konton får använda detta verktyg');
  }

  return {
    userId: userData.user.id,
    email: userData.user.email ?? null,
    client,
    serviceClient,
  };
}
