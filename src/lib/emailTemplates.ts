// Mejlmallar för admin-betalverktyget.
//
// TVÅ mallar:
//   1. paymentLinkTemplate         — info-mejl + unik Stripe-länk
//   2. paymentConfirmationTemplate — bekräftelse efter betalning
//
// Klistra in din färdiga HTML/text i `subject`, `html` och `text` nedan.
// Använd {{namn}}-placeholders — se TemplateVars för tillgängliga fält.
// Allt utbyte sker i `renderTemplate` längst ner i filen.

export interface TemplateVars {
  recipient_name: string;
  recipient_email: string;
  recipient_phone?: string;
  reference_id: string;
  group_name?: string;
  amount_sek: number;
  amount_formatted: string; // t.ex. "1 245 kr"
  stripe_url?: string;
  description?: string;
  paid_at?: string; // ISO-datum, formaterat innan render
  // Lägg till fler fält här om dina mallar behöver dem.
  [key: string]: string | number | undefined;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// ─────────────────────────────────────────────────────────────
// Mejl 1 — info + Stripe-betallink
// ─────────────────────────────────────────────────────────────
export const paymentLinkTemplate: EmailTemplate = {
  subject: 'Din betallink från Vinstpotten — {{group_name}}',
  // TODO: Klistra in den färdiga HTML-mallen här.
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
  // TODO: Klistra in plain-text-versionen här.
  text: `Hej {{recipient_name}},

Här kommer din betallink för {{group_name}} (ref {{reference_id}}).

Att betala: {{amount_formatted}}

Betala här: {{stripe_url}}

{{description}}

— Vinstpotten`,
};

// ─────────────────────────────────────────────────────────────
// Mejl 2 — betalningsbekräftelse (Stripe ej krävs)
// ─────────────────────────────────────────────────────────────
export const paymentConfirmationTemplate: EmailTemplate = {
  subject: 'Tack — betalningen är mottagen ({{group_name}})',
  // TODO: Klistra in den färdiga HTML-mallen här.
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

// ─────────────────────────────────────────────────────────────
// Render — substituerar {{var}}-placeholders. Saknade fält
// ersätts med tom sträng så mallar inte spricker när data
// är ofullständig.
// ─────────────────────────────────────────────────────────────
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

export const TEMPLATE_KEYS = ['payment_link', 'payment_confirmation'] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const TEMPLATES: Record<TemplateKey, EmailTemplate> = {
  payment_link: paymentLinkTemplate,
  payment_confirmation: paymentConfirmationTemplate,
};

export function formatSEKAmount(amount: number): string {
  return new Intl.NumberFormat('sv-SE').format(amount) + ' kr';
}
