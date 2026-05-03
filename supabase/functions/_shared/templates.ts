// Server-side mejlmallar — speglar src/lib/emailTemplates.ts.
//
// Vi duplicerar avsiktligt: klientens kopia driver UI-förhandsvisningen,
// serverns kopia är källan-till-sanning vid skick (klient kan inte
// manipulera vad som faktiskt skickas).

export interface TemplateVars {
  recipient_name?: string;
  recipient_email?: string;
  reference_id?: string;
  group_name?: string;
  amount_sek?: number;
  amount_formatted?: string;
  stripe_url?: string;
  description?: string;
  paid_at?: string;
  [key: string]: string | number | undefined;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const paymentLinkTemplate: EmailTemplate = {
  subject: 'Din betallink från Vinstpotten — {{group_name}}',
  html: `<!doctype html>
<html lang="sv">
  <body style="margin:0;padding:32px;font-family:-apple-system,system-ui,sans-serif;background:#F4EFE6;color:#1A1410;">
    <div style="max-width:560px;margin:0 auto;background:#fff;padding:40px;border-radius:8px;">
      <h1 style="font-family:'Times New Roman',serif;font-size:32px;margin:0 0 24px;">Hej {{recipient_name}},</h1>
      <p style="font-size:16px;line-height:1.6;">Här kommer din betallink för <strong>{{group_name}}</strong> (ref {{reference_id}}).</p>
      <p style="font-size:16px;line-height:1.6;">Att betala: <strong>{{amount_formatted}}</strong></p>
      <p style="margin:32px 0;">
        <a href="{{stripe_url}}" style="display:inline-block;background:#3F2742;color:#F4EFE6;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:500;">
          Betala via Stripe →
        </a>
      </p>
      <p style="font-size:14px;color:#7A6A5A;line-height:1.6;">{{description}}</p>
      <hr style="border:none;border-top:1px solid #1A141022;margin:32px 0;" />
      <p style="font-size:12px;color:#7A6A5A;">Vinstpotten · Klasskassan på en vecka</p>
    </div>
  </body>
</html>`,
  text: `Hej {{recipient_name}},

Här kommer din betallink för {{group_name}} (ref {{reference_id}}).

Att betala: {{amount_formatted}}

Betala här: {{stripe_url}}

{{description}}

— Vinstpotten`,
};

export const paymentConfirmationTemplate: EmailTemplate = {
  subject: 'Tack — betalningen är mottagen ({{group_name}})',
  html: `<!doctype html>
<html lang="sv">
  <body style="margin:0;padding:32px;font-family:-apple-system,system-ui,sans-serif;background:#F4EFE6;color:#1A1410;">
    <div style="max-width:560px;margin:0 auto;background:#fff;padding:40px;border-radius:8px;">
      <h1 style="font-family:'Times New Roman',serif;font-size:32px;margin:0 0 24px;">Tack {{recipient_name}}!</h1>
      <p style="font-size:16px;line-height:1.6;">Vi har mottagit din betalning på <strong>{{amount_formatted}}</strong> för {{group_name}}.</p>
      <p style="font-size:14px;color:#7A6A5A;">Referens: {{reference_id}}{{paid_at}}</p>
      <hr style="border:none;border-top:1px solid #1A141022;margin:32px 0;" />
      <p style="font-size:12px;color:#7A6A5A;">Vinstpotten · Klasskassan på en vecka</p>
    </div>
  </body>
</html>`,
  text: `Tack {{recipient_name}}!

Vi har mottagit din betalning på {{amount_formatted}} för {{group_name}}.

Referens: {{reference_id}}{{paid_at}}

— Vinstpotten`,
};

export function renderTemplate(template: EmailTemplate, vars: TemplateVars): EmailTemplate {
  const replace = (str: string) =>
    str.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
      const v = vars[key];
      return v === undefined || v === null ? '' : String(v);
    });
  return {
    subject: replace(template.subject),
    html: replace(template.html),
    text: replace(template.text),
  };
}

export function formatSEKAmount(amount: number): string {
  return new Intl.NumberFormat('sv-SE').format(amount) + ' kr';
}
