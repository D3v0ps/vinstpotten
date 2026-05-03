// Mejl-leverantör. Default: Resend (https://resend.com) — enkel HTTP-API,
// inga dependencies. Byt ut sendMail() om du vill köra Postmark/SendGrid.
//
// Kräver env-vars (sätts i Supabase project settings → Edge Functions → Secrets):
//   RESEND_API_KEY  — t.ex. re_xxxxxxxx
//   MAIL_FROM       — t.ex. "Vinstpotten <noreply@vinstpotten.se>"

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
}

export interface SendMailResult {
  provider: string;
  message_id?: string;
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  if (!apiKey) throw new Error('RESEND_API_KEY saknas i Edge Function secrets');
  if (!from) throw new Error('MAIL_FROM saknas i Edge Function secrets');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.reply_to,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend API error: ${data?.message ?? res.status}`);
  }
  return { provider: 'resend', message_id: data?.id };
}
