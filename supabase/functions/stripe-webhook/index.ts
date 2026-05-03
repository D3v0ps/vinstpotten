// Edge Function: stripe-webhook
//
// Tar emot Stripe-events. Vi bryr oss bara om checkout.session.completed
// och checkout.session.expired för att uppdatera payment_links.status.
//
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// (--no-verify-jwt eftersom Stripe inte skickar Supabase-auth)
//
// Konfigurera webhook i Stripe Dashboard → Developers → Webhooks:
//   URL: https://<project>.supabase.co/functions/v1/stripe-webhook
//   Events: checkout.session.completed, checkout.session.expired
// Spara secret som STRIPE_WEBHOOK_SECRET i Edge Function secrets.

// @ts-ignore — Deno-only import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { verifyStripeSignature } from '../_shared/stripe.ts';

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      payment_intent?: string;
      payment_status?: string;
      customer_email?: string;
      amount_total?: number;
      metadata?: Record<string, string>;
    };
  };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) return new Response('STRIPE_WEBHOOK_SECRET saknas', { status: 500 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response('Supabase secrets saknas', { status: 500 });
  }

  // Vi måste läsa råa bytes för signaturverifiering — INTE req.json().
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  const valid = await verifyStripeSignature(payload, signature, webhookSecret);
  if (!valid) {
    console.warn('[stripe-webhook] invalid signature');
    return new Response('Invalid signature', { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { error } = await supabase
      .from('payment_links')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent ?? null,
      })
      .eq('stripe_session_id', session.id);
    if (error) {
      console.error('[stripe-webhook] update failed', error);
      return new Response('DB update failed', { status: 500 });
    }
    console.log('[stripe-webhook] marked paid', session.id);
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    await supabase
      .from('payment_links')
      .update({ status: 'expired' })
      .eq('stripe_session_id', session.id);
  }

  return new Response('ok', { status: 200 });
});
