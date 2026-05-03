import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { supabase, type Session } from '@/lib/supabase';
import { useIsMobile } from '@/lib/useResponsive';
import { theme } from '@/theme';
import {
  createPaymentLink,
  isAdmin,
  listRecentPaymentLinks,
  lookupReference,
  sendPaymentConfirmation,
  type PaymentLink,
  type ReferenceLookup,
} from '@/lib/admin';
import {
  TEMPLATES,
  formatSEKAmount,
  renderTemplate,
  type TemplateKey,
} from '@/lib/emailTemplates';

type Status = { kind: 'idle' } | { kind: 'busy' } | { kind: 'ok'; msg: string } | { kind: 'err'; msg: string };

export function Admin() {
  const mobile = useIsMobile();
  const T = theme;
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setAdmin(data.session ? await isAdmin() : false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setAdmin(s ? await isAdmin() : false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (admin === null) {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: T.muted, fontFamily: T.mono, fontSize: 12 }}>
        Laddar…
      </div>
    );
  }

  return (
    <div
      style={{
        background: T.bg,
        color: T.fg,
        fontFamily: T.ui,
        minHeight: '70vh',
        padding: mobile ? '32px 24px 80px' : '64px 80px 120px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {!session ? (
          <SignIn mobile={mobile} />
        ) : !admin ? (
          <NotAdmin email={session.user.email ?? ''} mobile={mobile} />
        ) : (
          <Dashboard mobile={mobile} />
        )}
      </div>
    </div>
  );
}

function SignIn({ mobile }: { mobile: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/admin' },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <Eyebrow>Admin</Eyebrow>
      <Title mobile={mobile}>Logga in</Title>
      <p style={{ fontSize: mobile ? 16 : 18, opacity: 0.78, marginTop: 24, lineHeight: 1.5 }}>
        Magic link skickas till din mejl. Endast admin-konton släpps in.
      </p>
      <form onSubmit={submit} style={{ marginTop: 32 }}>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@vinstpotten.se"
          disabled={status === 'sending' || status === 'sent'}
        />
        <Button
          type="submit"
          disabled={status === 'sending' || status === 'sent'}
          style={{ width: '100%', marginTop: 16 }}
        >
          {status === 'sending' ? 'Skickar…' : status === 'sent' ? '✓ Skickad — kolla mejlen' : 'Skicka magisk länk →'}
        </Button>
      </form>
      {status === 'error' && <ErrorBox>{errorMsg}</ErrorBox>}
    </div>
  );
}

function NotAdmin({ email, mobile }: { email: string; mobile: boolean }) {
  return (
    <div style={{ maxWidth: 480 }}>
      <Eyebrow>Admin</Eyebrow>
      <Title mobile={mobile}>Saknar behörighet</Title>
      <p style={{ fontSize: mobile ? 16 : 18, opacity: 0.78, marginTop: 24, lineHeight: 1.5 }}>
        Inloggad som <strong>{email}</strong>. Detta konto är inte admin. Be om uppgradering eller logga ut.
      </p>
      <Button onClick={() => supabase.auth.signOut()} style={{ marginTop: 24 }}>
        Logga ut
      </Button>
    </div>
  );
}

function Dashboard({ mobile }: { mobile: boolean }) {
  const T = theme;
  const [tab, setTab] = useState<TemplateKey>('payment_link');
  const [recent, setRecent] = useState<PaymentLink[]>([]);

  const refresh = async () => setRecent(await listRecentPaymentLinks(10));

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: mobile ? 32 : 48,
        }}
      >
        <div>
          <Eyebrow>Admin · betalverktyg</Eyebrow>
          <Title mobile={mobile}>
            Skicka <em style={{ fontStyle: 'italic', color: T.primary }}>betallink</em> eller bekräftelse.
          </Title>
        </div>
        <Button onClick={() => supabase.auth.signOut()} ghost>
          Logga ut
        </Button>
      </div>

      <Tabs value={tab} onChange={setTab} />

      {tab === 'payment_link' ? (
        <PaymentLinkForm onSent={refresh} mobile={mobile} />
      ) : (
        <ConfirmationForm mobile={mobile} />
      )}

      <h2
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 24 : 28,
          marginTop: 64,
          marginBottom: 16,
          fontWeight: 400,
          letterSpacing: '-0.02em',
        }}
      >
        Senaste betallänkar
      </h2>
      <RecentLinks rows={recent} />
    </>
  );
}

function Tabs({ value, onChange }: { value: TemplateKey; onChange: (v: TemplateKey) => void }) {
  const T = theme;
  const tabs: { key: TemplateKey; label: string }[] = [
    { key: 'payment_link', label: 'Mejl 1 — Betallink' },
    { key: 'payment_confirmation', label: 'Mejl 2 — Bekräftelse' },
  ];
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.fg}33`, marginBottom: 32 }}>
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${active ? T.primary : 'transparent'}`,
              padding: '14px 24px',
              fontFamily: T.ui,
              fontSize: 14,
              fontWeight: active ? 500 : 400,
              color: active ? T.fg : T.muted,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

interface CommonFields {
  reference_id: string;
  recipient_email: string;
  recipient_name: string;
  amount_sek: string; // string for input control
  group_name: string;
  description: string;
}

function blankFields(): CommonFields {
  return {
    reference_id: '',
    recipient_email: '',
    recipient_name: '',
    amount_sek: '',
    group_name: '',
    description: '',
  };
}

function applyLookup(prev: CommonFields, look: ReferenceLookup): CommonFields {
  return {
    ...prev,
    recipient_email: prev.recipient_email || look.recipient_email || '',
    recipient_name: prev.recipient_name || look.recipient_name || '',
    group_name: prev.group_name || look.group_name || '',
    amount_sek:
      prev.amount_sek ||
      (look.estimated_revenue ? String(look.estimated_revenue) : ''),
  };
}

function PaymentLinkForm({ onSent, mobile }: { onSent: () => void; mobile: boolean }) {
  const [fields, setFields] = useState<CommonFields>(blankFields());
  const [lookup, setLookup] = useState<ReferenceLookup | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const onRefBlur = async () => {
    if (!fields.reference_id) return;
    const result = await lookupReference(fields.reference_id);
    setLookup(result);
    if (result) setFields((p) => applyLookup(p, result));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ kind: 'busy' });
    try {
      const amount = parseInt(fields.amount_sek, 10);
      if (!amount || amount <= 0) throw new Error('Ange ett giltigt belopp i kr');
      const result = await createPaymentLink({
        reference_id: fields.reference_id.trim(),
        recipient_email: fields.recipient_email.trim(),
        recipient_name: fields.recipient_name.trim() || undefined,
        amount_sek: amount,
        description: fields.description.trim() || undefined,
        group_name: fields.group_name.trim() || undefined,
        send_email: true,
      });
      setStatus({
        kind: 'ok',
        msg: result.email_sent
          ? `Betallink skapad och mejl skickat till ${fields.recipient_email}.`
          : `Betallink skapad: ${result.stripe_url}`,
      });
      setFields(blankFields());
      setLookup(null);
      onSent();
    } catch (err) {
      setStatus({ kind: 'err', msg: (err as Error).message });
    }
  };

  const previewVars = useMemo(
    () => ({
      recipient_name: fields.recipient_name || '[namn]',
      recipient_email: fields.recipient_email,
      reference_id: fields.reference_id || '[ref]',
      group_name: fields.group_name || '[grupp]',
      amount_sek: parseInt(fields.amount_sek, 10) || 0,
      amount_formatted: fields.amount_sek
        ? formatSEKAmount(parseInt(fields.amount_sek, 10) || 0)
        : '[belopp]',
      stripe_url: '[Stripe-länk skapas vid skick]',
      description: fields.description,
    }),
    [fields],
  );

  return (
    <form onSubmit={submit}>
      <FieldGrid mobile={mobile}>
        <Field label="Reg/deltagar-ID" full>
          <Input
            required
            value={fields.reference_id}
            onChange={(e) => setFields({ ...fields, reference_id: e.target.value })}
            onBlur={onRefBlur}
            placeholder="t.ex. 9b2f0c4e-… (UUID från order eller deltagare)"
          />
          {lookup && (
            <Hint>
              ✓ Hittade {lookup.source === 'order' ? 'order' : 'deltagare'} —{' '}
              {lookup.recipient_name ?? lookup.group_name ?? '(okänt namn)'}
            </Hint>
          )}
        </Field>
        <Field label="Mottagarens mejl">
          <Input
            type="email"
            required
            value={fields.recipient_email}
            onChange={(e) => setFields({ ...fields, recipient_email: e.target.value })}
          />
        </Field>
        <Field label="Mottagarens namn">
          <Input
            value={fields.recipient_name}
            onChange={(e) => setFields({ ...fields, recipient_name: e.target.value })}
          />
        </Field>
        <Field label="Grupp / kampanj">
          <Input
            value={fields.group_name}
            onChange={(e) => setFields({ ...fields, group_name: e.target.value })}
          />
        </Field>
        <Field label="Belopp (kr)">
          <Input
            type="number"
            min={1}
            required
            value={fields.amount_sek}
            onChange={(e) => setFields({ ...fields, amount_sek: e.target.value })}
            placeholder="1245"
          />
        </Field>
        <Field label="Beskrivning på Stripe-sidan" full>
          <Input
            value={fields.description}
            onChange={(e) => setFields({ ...fields, description: e.target.value })}
            placeholder="Startpaket Vinstpotten — 9A"
          />
        </Field>
      </FieldGrid>

      <Preview templateKey="payment_link" vars={previewVars} />

      <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button type="submit" disabled={status.kind === 'busy'}>
          {status.kind === 'busy' ? 'Skickar…' : 'Skapa länk + skicka mejl 1 →'}
        </Button>
        {status.kind === 'ok' && <SuccessText>{status.msg}</SuccessText>}
      </div>
      {status.kind === 'err' && <ErrorBox>{status.msg}</ErrorBox>}
    </form>
  );
}

function ConfirmationForm({ mobile }: { mobile: boolean }) {
  const [fields, setFields] = useState<CommonFields>(blankFields());
  const [lookup, setLookup] = useState<ReferenceLookup | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const onRefBlur = async () => {
    if (!fields.reference_id) return;
    const result = await lookupReference(fields.reference_id);
    setLookup(result);
    if (result) setFields((p) => applyLookup(p, result));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ kind: 'busy' });
    try {
      const amount = parseInt(fields.amount_sek, 10);
      await sendPaymentConfirmation({
        reference_id: fields.reference_id.trim(),
        recipient_email: fields.recipient_email.trim(),
        recipient_name: fields.recipient_name.trim() || undefined,
        amount_sek: amount || 0,
        group_name: fields.group_name.trim() || undefined,
      });
      setStatus({ kind: 'ok', msg: `Bekräftelse skickad till ${fields.recipient_email}.` });
      setFields(blankFields());
      setLookup(null);
    } catch (err) {
      setStatus({ kind: 'err', msg: (err as Error).message });
    }
  };

  const previewVars = useMemo(
    () => ({
      recipient_name: fields.recipient_name || '[namn]',
      recipient_email: fields.recipient_email,
      reference_id: fields.reference_id || '[ref]',
      group_name: fields.group_name || '[grupp]',
      amount_sek: parseInt(fields.amount_sek, 10) || 0,
      amount_formatted: fields.amount_sek
        ? formatSEKAmount(parseInt(fields.amount_sek, 10) || 0)
        : '[belopp]',
      paid_at: ` · ${new Date().toLocaleDateString('sv-SE')}`,
    }),
    [fields],
  );

  return (
    <form onSubmit={submit}>
      <FieldGrid mobile={mobile}>
        <Field label="Reg/deltagar-ID" full>
          <Input
            required
            value={fields.reference_id}
            onChange={(e) => setFields({ ...fields, reference_id: e.target.value })}
            onBlur={onRefBlur}
            placeholder="UUID från order eller deltagare"
          />
          {lookup && (
            <Hint>
              ✓ Hittade {lookup.source === 'order' ? 'order' : 'deltagare'} —{' '}
              {lookup.recipient_name ?? lookup.group_name ?? '(okänt namn)'}
            </Hint>
          )}
        </Field>
        <Field label="Mottagarens mejl">
          <Input
            type="email"
            required
            value={fields.recipient_email}
            onChange={(e) => setFields({ ...fields, recipient_email: e.target.value })}
          />
        </Field>
        <Field label="Mottagarens namn">
          <Input
            value={fields.recipient_name}
            onChange={(e) => setFields({ ...fields, recipient_name: e.target.value })}
          />
        </Field>
        <Field label="Grupp / kampanj">
          <Input
            value={fields.group_name}
            onChange={(e) => setFields({ ...fields, group_name: e.target.value })}
          />
        </Field>
        <Field label="Belopp (kr) — visas i mejlet">
          <Input
            type="number"
            min={0}
            value={fields.amount_sek}
            onChange={(e) => setFields({ ...fields, amount_sek: e.target.value })}
          />
        </Field>
      </FieldGrid>

      <Preview templateKey="payment_confirmation" vars={previewVars} />

      <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button type="submit" disabled={status.kind === 'busy'}>
          {status.kind === 'busy' ? 'Skickar…' : 'Skicka mejl 2 →'}
        </Button>
        {status.kind === 'ok' && <SuccessText>{status.msg}</SuccessText>}
      </div>
      {status.kind === 'err' && <ErrorBox>{status.msg}</ErrorBox>}
    </form>
  );
}

function Preview({
  templateKey,
  vars,
}: {
  templateKey: TemplateKey;
  vars: Parameters<typeof renderTemplate>[1];
}) {
  const T = theme;
  const rendered = useMemo(() => renderTemplate(TEMPLATES[templateKey], vars), [templateKey, vars]);
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 24, border: `1px solid ${T.fg}22`, padding: 16, background: '#fff' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          fontFamily: T.mono,
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.muted,
          cursor: 'pointer',
        }}
      >
        {open ? '▾' : '▸'} Förhandsgranska mejl
      </button>
      {open && (
        <>
          <div style={{ fontSize: 13, marginTop: 12, marginBottom: 8 }}>
            <strong>Ämne:</strong> {rendered.subject}
          </div>
          <iframe
            title="Förhandsgranskning"
            srcDoc={rendered.html}
            style={{ width: '100%', height: 360, border: `1px solid ${T.fg}11` }}
          />
        </>
      )}
    </div>
  );
}

function RecentLinks({ rows }: { rows: PaymentLink[] }) {
  const T = theme;
  if (rows.length === 0) {
    return (
      <div style={{ color: T.muted, fontFamily: T.mono, fontSize: 12, padding: 16 }}>
        Inga skickade länkar än.
      </div>
    );
  }
  return (
    <div style={{ border: `1px solid ${T.fg}22` }}>
      {rows.map((r, i) => (
        <div
          key={r.id}
          style={{
            padding: '14px 16px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.fg}11`,
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto',
            gap: 16,
            alignItems: 'center',
            fontSize: 13,
          }}
        >
          <div>
            <div style={{ fontWeight: 500 }}>{r.recipient_name ?? r.recipient_email}</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
              ref {r.reference_id} · {new Date(r.created_at).toLocaleString('sv-SE')}
            </div>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 12 }}>{formatSEKAmount(r.amount_sek)}</div>
          <StatusBadge status={r.status} />
          {r.stripe_url && (
            <a
              href={r.stripe_url}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: T.primary }}
            >
              Öppna →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentLink['status'] }) {
  const T = theme;
  const tone =
    status === 'paid'
      ? { bg: T.primary, fg: T.primaryFg }
      : status === 'pending'
      ? { bg: `${T.fg}10`, fg: T.fg }
      : { bg: '#fee', fg: '#900' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        background: tone.bg,
        color: tone.fg,
        fontFamily: T.mono,
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        borderRadius: 999,
      }}
    >
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Layout primitives
// ─────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  const T = theme;
  return (
    <div
      style={{
        fontFamily: T.mono,
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: T.muted,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Title({ children, mobile }: { children: React.ReactNode; mobile: boolean }) {
  const T = theme;
  return (
    <h1
      style={{
        fontFamily: T.display,
        fontSize: mobile ? 40 : 56,
        margin: 0,
        fontWeight: 400,
        letterSpacing: '-0.025em',
        lineHeight: 1.05,
      }}
    >
      {children}
    </h1>
  );
}

function FieldGrid({ children, mobile }: { children: React.ReactNode; mobile: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  const T = theme;
  return (
    <label style={{ display: 'block', gridColumn: full ? '1 / -1' : 'auto' }}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.muted,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const T = theme;
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '12px 16px',
        fontSize: 15,
        fontFamily: T.ui,
        border: `1px solid ${T.fg}33`,
        background: '#fff',
        color: T.fg,
        borderRadius: 4,
        outline: 'none',
        boxSizing: 'border-box',
        ...(props.style ?? {}),
      }}
    />
  );
}

function Button({
  ghost,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { ghost?: boolean }) {
  const T = theme;
  return (
    <button
      {...props}
      style={{
        padding: '12px 22px',
        background: ghost ? 'transparent' : T.primary,
        color: ghost ? T.fg : T.primaryFg,
        border: ghost ? `1px solid ${T.fg}33` : 'none',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: T.ui,
        cursor: props.disabled ? 'wait' : 'pointer',
        opacity: props.disabled ? 0.6 : 1,
        ...(props.style ?? {}),
      }}
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  const T = theme;
  return (
    <div style={{ fontSize: 12, color: T.muted, marginTop: 6, fontFamily: T.mono }}>{children}</div>
  );
}

function SuccessText({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 13, color: '#1f6f3f' }}>{children}</span>;
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        background: '#fee',
        color: '#900',
        border: '1px solid #f00',
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

export default Admin;
