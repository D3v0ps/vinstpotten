// Edge Function: send-payment-confirmation
//
// Skickar mejl 2 (betalningsbekräftelse) — kräver inte Stripe.
// Anropas manuellt från admin-sidan, eller (när webhook är aktiv)
// triggas också av stripe-webhook.
//
// Deploy: supabase functions deploy send-payment-confirmation

import { corsHeaders, errorResponse, jsonResponse, preflight } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';
import { sendMail } from '../_shared/email.ts';
import {
  formatSEKAmount,
  paymentConfirmationTemplate,
  renderTemplate,
} from '../_shared/templates.ts';

interface RequestBody {
  reference_id: string;
  recipient_email: string;
  recipient_name?: string;
  amount_sek: number;
  group_name?: string;
  paid_at?: string;
  payment_link_id?: string;
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

    const paidAt = body.paid_at
      ? ` · ${new Date(body.paid_at).toLocaleDateString('sv-SE')}`
      : ` · ${new Date().toLocaleDateString('sv-SE')}`;

    const rendered = renderTemplate(paymentConfirmationTemplate, {
      recipient_name: body.recipient_name ?? '',
      recipient_email: body.recipient_email,
      reference_id: body.reference_id,
      group_name: body.group_name ?? '',
      amount_sek: body.amount_sek ?? 0,
      amount_formatted: formatSEKAmount(body.amount_sek ?? 0),
      paid_at: paidAt,
    });

    let logId: string | null = null;
    try {
      const mail = await sendMail({
        to: body.recipient_email.trim(),
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });
      const { data, error } = await ctx.serviceClient
        .from('email_log')
        .insert({
          template: 'payment_confirmation',
          reference_id: body.reference_id,
          payment_link_id: body.payment_link_id ?? null,
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
        })
        .select('id')
        .single();
      if (error) console.warn('[send-payment-confirmation] log insert failed', error);
      logId = data?.id ?? null;
      return jsonResponse({ email_sent: true, email_log_id: logId });
    } catch (mailErr) {
      const msg = mailErr instanceof Error ? mailErr.message : String(mailErr);
      const { data } = await ctx.serviceClient
        .from('email_log')
        .insert({
          template: 'payment_confirmation',
          reference_id: body.reference_id,
          payment_link_id: body.payment_link_id ?? null,
          recipient_email: body.recipient_email,
          recipient_name: body.recipient_name ?? null,
          subject: rendered.subject,
          body_html: rendered.html,
          body_text: rendered.text,
          status: 'failed',
          error: msg,
          created_by: ctx.userId,
        })
        .select('id')
        .single();
      logId = data?.id ?? null;
      return errorResponse(`Mejlskick misslyckades: ${msg}`, 502);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    console.error('[send-payment-confirmation] error', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: msg.includes('admin') ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
