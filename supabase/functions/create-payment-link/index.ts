// Edge Function: create-payment-link
//
// Anropas från admin-sidan. Skapar en Stripe Checkout Session, skriver
// rad i `payment_links`, och skickar (om send_email=true) info-mejlet med
// betallänken till mottagaren.
//
// Deploy: supabase functions deploy create-payment-link
// Secrets som krävs:
//   STRIPE_SECRET_KEY      — sk_test_… eller sk_live_…
//   RESEND_API_KEY         — Resend API key
//   MAIL_FROM              — t.ex. "Vinstpotten <noreply@vinstpotten.se>"
//   STRIPE_SUCCESS_URL     — t.ex. https://vinstpotten.se/admin/betald
//   STRIPE_CANCEL_URL      — t.ex. https://vinstpotten.se/admin/avbruten

import { corsHeaders, errorResponse, jsonResponse, preflight } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';
import { createCheckoutSession } from '../_shared/stripe.ts';
import { sendMail } from '../_shared/email.ts';
import { formatSEKAmount, paymentLinkTemplate, renderTemplate } from '../_shared/templates.ts';

interface RequestBody {
  reference_id: string;
  recipient_email: string;
  recipient_name?: string;
  recipient_phone?: string;
  amount_sek: number;
  description?: string;
  group_name?: string;
  send_email?: boolean;
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405);

  try {
    const ctx = await requireAdmin(req);
    const body = (await req.json()) as RequestBody;

    if (!body.reference_id?.trim()) return errorResponse('reference_id saknas');
    if (!body.recipient_email?.trim()) return errorResponse('recipient_email saknas');
    if (!body.amount_sek || body.amount_sek <= 0) return errorResponse('amount_sek måste vara > 0');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) return errorResponse('STRIPE_SECRET_KEY saknas i Edge Function secrets', 500);

    const successUrl =
      Deno.env.get('STRIPE_SUCCESS_URL') ?? 'https://example.com/admin/betald';
    const cancelUrl =
      Deno.env.get('STRIPE_CANCEL_URL') ?? 'https://example.com/admin/avbruten';

    const description =
      body.description?.trim() ||
      (body.group_name ? `Vinstpotten — ${body.group_name}` : 'Vinstpotten');

    // 1. Skapa Stripe Checkout Session
    const session = await createCheckoutSession(stripeKey, {
      amount_sek: body.amount_sek,
      description,
      reference_id: body.reference_id.trim(),
      recipient_email: body.recipient_email.trim(),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        reference_id: body.reference_id.trim(),
        recipient_email: body.recipient_email.trim(),
        ...(body.group_name ? { group_name: body.group_name } : {}),
      },
    });

    // 2. Skriv payment_links-raden via service role
    const { data: linkRow, error: linkError } = await ctx.serviceClient
      .from('payment_links')
      .insert({
        reference_id: body.reference_id.trim(),
        recipient_email: body.recipient_email.trim(),
        recipient_name: body.recipient_name?.trim() ?? null,
        recipient_phone: body.recipient_phone?.trim() ?? null,
        amount_sek: body.amount_sek,
        description,
        stripe_session_id: session.id,
        stripe_url: session.url,
        expires_at: new Date(session.expires_at * 1000).toISOString(),
        metadata: { group_name: body.group_name ?? null },
        created_by: ctx.userId,
      })
      .select('*')
      .single();

    if (linkError) {
      console.error('[create-payment-link] insert failed', linkError);
      return errorResponse(`Kunde inte spara payment_link: ${linkError.message}`, 500);
    }

    // 3. Skicka mejl 1 om begärt
    let emailSent = false;
    if (body.send_email !== false) {
      const rendered = renderTemplate(paymentLinkTemplate, {
        recipient_name: body.recipient_name ?? '',
        recipient_email: body.recipient_email,
        reference_id: body.reference_id,
        group_name: body.group_name ?? '',
        amount_sek: body.amount_sek,
        amount_formatted: formatSEKAmount(body.amount_sek),
        stripe_url: session.url,
        description,
      });
      try {
        const mail = await sendMail({
          to: body.recipient_email.trim(),
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        });
        emailSent = true;
        await ctx.serviceClient.from('email_log').insert({
          template: 'payment_link',
          reference_id: body.reference_id,
          payment_link_id: linkRow.id,
          recipient_email: body.recipient_email,
          recipient_name: body.recipient_name ?? null,
          subject: rendered.subject,
          body_html: rendered.html,
          body_text: rendered.text,
          status: 'sent',
          provider: mail.provider,
          provider_message_id: mail.message_id ?? null,
          sent_at: new Date().toISOString(),
          created_by: ctx.userId,
        });
      } catch (mailErr) {
        const msg = mailErr instanceof Error ? mailErr.message : String(mailErr);
        console.error('[create-payment-link] sendMail failed', msg);
        await ctx.serviceClient.from('email_log').insert({
          template: 'payment_link',
          reference_id: body.reference_id,
          payment_link_id: linkRow.id,
          recipient_email: body.recipient_email,
          recipient_name: body.recipient_name ?? null,
          subject: rendered.subject,
          body_html: rendered.html,
          body_text: rendered.text,
          status: 'failed',
          error: msg,
          created_by: ctx.userId,
        });
        // Mejlet misslyckades men länken finns — returnera ändå framgång,
        // så admin kan kopiera URL:en manuellt.
        return jsonResponse({
          payment_link: linkRow,
          stripe_url: session.url,
          email_sent: false,
          email_error: msg,
        });
      }
    }

    return jsonResponse({
      payment_link: linkRow,
      stripe_url: session.url,
      email_sent: emailSent,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    console.error('[create-payment-link] error', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: msg.includes('admin') ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
