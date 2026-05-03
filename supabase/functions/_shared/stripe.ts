// Tunn Stripe-klient via fetch — undviker NPM-beroenden och funkar i Deno
// utan dependency-resolution.
//
// Vi använder Stripe Checkout Sessions (price_data inline) så vi slipper
// förskapa Products/Prices i Stripe. Ger en betalbar URL omedelbart.

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

function form(params: Record<string, string | number | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    u.append(k, String(v));
  }
  return u.toString();
}

interface StripeRequestOptions {
  method?: 'GET' | 'POST';
  body?: string;
}

async function stripeRequest<T>(
  path: string,
  apiKey: string,
  opts: StripeRequestOptions = {},
): Promise<T> {
  const res = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: opts.method ?? 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: opts.body,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = data?.error?.message ?? `Stripe request failed: ${res.status}`;
    throw new Error(err);
  }
  return data as T;
}

export interface CheckoutSessionInput {
  amount_sek: number;
  description: string;
  reference_id: string;
  recipient_email?: string;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  payment_intent: string | null;
  expires_at: number;
}

export async function createCheckoutSession(
  apiKey: string,
  input: CheckoutSessionInput,
): Promise<CheckoutSession> {
  const body = form({
    mode: 'payment',
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'sek',
    'line_items[0][price_data][unit_amount]': input.amount_sek * 100,
    'line_items[0][price_data][product_data][name]': input.description,
    'line_items[0][quantity]': 1,
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    customer_email: input.recipient_email,
    'metadata[reference_id]': input.reference_id,
    ...Object.fromEntries(
      Object.entries(input.metadata ?? {}).map(([k, v]) => [`metadata[${k}]`, v]),
    ),
  });
  return stripeRequest<CheckoutSession>('/checkout/sessions', apiKey, { body });
}

// Stripe webhook signature verification — HMAC-SHA256 of timestamp + payload.
// Deno's std crypto exposes crypto.subtle which we use to keep this dependency-free.
export async function verifyStripeSignature(
  payload: string,
  signature: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!signature) return false;
  const parts = Object.fromEntries(
    signature.split(',').map((p) => {
      const idx = p.indexOf('=');
      return [p.slice(0, idx), p.slice(idx + 1)];
    }),
  );
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) return false;

  const timestamp = parseInt(t, 10);
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > toleranceSeconds) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signed = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`));
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  // Constant-time comparison
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}
