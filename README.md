# Vinstpotten

Klasskassan på en vecka. T-shirts på lager, ingen designavgift, inget förskott.

## Stack

- **Frontend:** Vite + React 18 + TypeScript + React Router
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Hosting:** one.com static hosting (deploy via GitHub Actions)
- **Auth:** Supabase magic-link initially, BankID via Signicat in fas 2

## Sidor

- `/` — Startsida (Säker design-riktning)
- `/bestall` — 3-stegs beställ-flöde (grupp → kontakt → verifiera)
- `/sa-funkar-det` — Hur processen fungerar
- `/kollektioner` — De sex kollektionerna i lager
- `/berattelser` — Case studies
- `/faq` — Vanliga frågor
- `/salj` — Säljardashboard (auth-skyddad)
- `/design-explorer.html` — Statisk referens med alla tre design-riktningar (Säker, Djärv, Oväntad)

## Lokal utveckling

```bash
npm install
cp .env.example .env       # Fyll i Supabase URL + anon key
npm run dev                # Starta dev-server på http://localhost:5173
```

### Supabase setup

Project: `iiwuyaqbueffptsuxhta` · URL: `https://iiwuyaqbueffptsuxhta.supabase.co`

1. Hämta anon key på supabase.com → Settings → API → "Project API keys" → `anon public`.
2. Lägg in i `.env`:
   ```
   VITE_SUPABASE_URL=https://iiwuyaqbueffptsuxhta.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```
3. Kör migrationen — antingen via Supabase MCP (`claude /mcp` → `supabase` → authenticate, sedan be Claude köra migrationen), eller manuellt:
   - SQL Editor → New query → klistra in `supabase/migrations/20260502000001_init.sql` → Run.
4. (Senare) Konfigurera magic-link-mejlmall i Auth → Email templates.

### Supabase MCP (för AI-assisterad utveckling)

Repot innehåller `.mcp.json` som registrerar Supabase MCP-servern. Första gången du kör Claude Code i repot:

```bash
claude /mcp                    # Välj 'supabase' → Authenticate
```

Efter autentisering kan Claude köra schema-ändringar, queries och seeding direkt mot ditt projekt.

## Deploy

Push till `main` triggar GitHub Actions som bygger och deployar till one.com.

### GitHub Secrets som krävs

Gå till **github.com/D3v0ps/vinstpotten/settings/secrets/actions** och lägg till:

- `VITE_SUPABASE_URL` — t.ex. `https://abcd.supabase.co`
- `VITE_SUPABASE_ANON_KEY` — Supabase project anon (public) key
- `SSH_HOST` — one.com SSH-host (visas i kontrollpanelen)
- `SSH_USER` — one.com SSH-användarnamn
- `SSH_PASSWORD` — one.com-lösenordet (eller använd SSH-nyckel istället)
- `SSH_REMOTE_PATH` — webroot-sökvägen, t.ex. `/webroots/<id>`

### Manuell deploy (lokalt → one.com)

```bash
npm run build
rsync -az --delete dist/ user@host:/webroots/0cb382e2/
```

## Admin-betalverktyg (`/admin`)

Tool för att skicka betallänkar och bekräftelsemejl utifrån ett reg/deltagar-ID.

### Setup

1. **Migration** — kör `supabase/migrations/20260503000001_admin_payment_tool.sql` (lägger till `payment_links`, `email_log`, `is_admin()`, `lookup_reference()`).
2. **Sätt admin-roll** på ditt konto i `profiles`-tabellen:
   ```sql
   update public.profiles set role = 'admin' where id = '<din-user-id>';
   ```
3. **Edge Function secrets** (Supabase dashboard → Edge Functions → Secrets, eller `supabase secrets set …`):
   - `STRIPE_SECRET_KEY` (`sk_test_…` / `sk_live_…`)
   - `STRIPE_WEBHOOK_SECRET` (`whsec_…`)
   - `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`
   - `RESEND_API_KEY`, `MAIL_FROM`
   - `SUPABASE_SERVICE_ROLE_KEY` (auto i de flesta fall, dubbelkolla)
4. **Deploy functions:**
   ```bash
   supabase functions deploy create-payment-link
   supabase functions deploy send-payment-confirmation
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
5. **Stripe webhook** — peka på `https://<project>.supabase.co/functions/v1/stripe-webhook` med events `checkout.session.completed`, `checkout.session.expired`.

### Mejlmallar

`src/lib/emailTemplates.ts` (klient/förhandsvisning) och `supabase/functions/_shared/templates.ts` (server/skick) håller två mallar — `payment_link` och `payment_confirmation`. Klistra in färdig HTML/text på de markerade ställena. Fält substitueras med `{{namn}}`-syntax (se `TemplateVars`).

## Roadmap

### Fas 1 (klart) — Statisk plattform med beställ-flöde
- [x] Startsida med räknesnurra
- [x] Beställ-flöde (3 steg, sparas i Supabase)
- [x] Säljardashboard med magic-link auth
- [x] FAQ, Kollektioner, Berättelser, Så funkar det
- [x] Deploy via GitHub Actions

### Fas 2 — Riktig BankID + säljarsidor
- [ ] BankID-integration via Signicat eller Svensk e-identitet
- [ ] Per-säljare QR-sida (`/s/:qrToken`) med Swish-betalning
- [ ] Realtidsuppdateringar via Supabase Realtime
- [ ] Admin-vy för Vinstpotten-personal

### Fas 3 — Tillväxt
- [ ] Riktig fotografering (placeholders ersätts)
- [ ] Mejlnotifikationer (orderbekräftelse, leveransinfo)
- [ ] Automatisk fakturering vid säljperiodens slut
- [ ] Lager-kampanj (Lagerräddningen)

## Säkerhet

- `.env` committas aldrig (se `.gitignore`).
- Supabase Row Level Security är på för alla tabeller.
- one.com SSH-credentials lagras som GitHub Secrets, aldrig i kod.
- Använd helst SSH-nyckel istället för lösenord (mer info i deploy-workflow).
