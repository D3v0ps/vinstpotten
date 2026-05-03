import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { calcResults, formatSEK, PRICE_PER_SHIRT, PROFIT_PER_SHIRT } from '@/lib/calculator';
import { ThemedSlider } from '@/components/ThemedSlider';
import { CountUp } from '@/components/CountUp';
import { useIsMobile } from '@/lib/useResponsive';
import { theme } from '@/theme';
import { supabase } from '@/lib/supabase';

type Step = 1 | 2 | 3 | 4;

interface OrderDraft {
  groupName: string;
  groupType: 'klass' | 'lag' | 'forening' | '';
  sellers: number;
  shirtsPer: number;
  goal: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  address: string;
  postal: string;
  city: string;
  acceptTerms: boolean;
}

const EMPTY: OrderDraft = {
  groupName: '',
  groupType: '',
  sellers: 24,
  shirtsPer: 8,
  goal: '',
  contactName: '',
  contactRole: '',
  email: '',
  phone: '',
  address: '',
  postal: '',
  city: '',
  acceptTerms: false,
};

export function Bestall() {
  const mobile = useIsMobile();
  const T = theme;
  const [params] = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<OrderDraft>(() => ({
    ...EMPTY,
    sellers: Number(params.get('sellers')) || EMPTY.sellers,
    shirtsPer: Number(params.get('shirts')) || EMPTY.shirtsPer,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const r = useMemo(() => calcResults(data.sellers, data.shirtsPer), [data.sellers, data.shirtsPer]);

  const update = <K extends keyof OrderDraft>(k: K, v: OrderDraft[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const canAdvance: Record<Step, boolean> = {
    1: data.groupName.trim().length > 0 && data.groupType !== '',
    2:
      data.contactName.trim().length > 0 &&
      data.email.trim().length > 4 &&
      data.phone.trim().length > 4,
    3: data.acceptTerms,
    4: true,
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('orders').insert({
        group_name: data.groupName,
        group_type: data.groupType,
        sellers: data.sellers,
        shirts_per_seller: data.shirtsPer,
        goal: data.goal || null,
        contact_name: data.contactName,
        contact_role: data.contactRole || null,
        email: data.email,
        phone: data.phone,
        address: data.address || null,
        postal: data.postal || null,
        city: data.city || null,
        estimated_profit: r.profit,
        estimated_revenue: r.revenue,
        total_shirts: r.totalShirts,
      });
      if (insertError) throw insertError;
      setStep(4);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Kunde inte skicka beställningen.';
      setError(`${msg} (kontakta hej@vinstpotten.se om det fortsätter)`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: T.bg,
        color: T.fg,
        fontFamily: T.ui,
        fontSize: mobile ? 15 : 16,
        minHeight: '70vh',
        padding: mobile ? '32px 24px 80px' : '64px 80px 120px',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <ProgressBar step={step} mobile={mobile} />

        {step === 1 && (
          <Step1
            mobile={mobile}
            data={data}
            update={update}
            r={r}
            onNext={() => canAdvance[1] && setStep(2)}
            disabled={!canAdvance[1]}
          />
        )}
        {step === 2 && (
          <Step2
            mobile={mobile}
            data={data}
            update={update}
            onBack={() => setStep(1)}
            onNext={() => canAdvance[2] && setStep(3)}
            disabled={!canAdvance[2]}
          />
        )}
        {step === 3 && (
          <Step3
            mobile={mobile}
            data={data}
            update={update}
            r={r}
            onBack={() => setStep(2)}
            onSubmit={submit}
            submitting={submitting}
            error={error}
            disabled={!canAdvance[3]}
          />
        )}
        {step === 4 && <Step4 mobile={mobile} data={data} r={r} />}
      </div>
    </div>
  );
}

function ProgressBar({ step, mobile }: { step: Step; mobile: boolean }) {
  const T = theme;
  const labels = ['Gruppen', 'Kontakt', 'Verifiera', 'Klart'];
  return (
    <div
      style={{
        display: 'flex',
        gap: mobile ? 8 : 24,
        marginBottom: mobile ? 32 : 56,
        flexWrap: 'wrap',
      }}
    >
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const isActive = step === n;
        const isDone = step > n;
        return (
          <div
            key={label}
            style={{
              flex: '1 1 0',
              borderTop: `2px solid ${isActive || isDone ? T.primary : `${T.fg}33`}`,
              paddingTop: 12,
              minWidth: mobile ? 64 : 100,
            }}
          >
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: T.muted,
                marginBottom: 4,
              }}
            >
              0{n}
            </div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: mobile ? 18 : 22,
                color: isActive || isDone ? T.fg : T.muted,
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Step1({
  mobile,
  data,
  update,
  r,
  onNext,
  disabled,
}: {
  mobile: boolean;
  data: OrderDraft;
  update: <K extends keyof OrderDraft>(k: K, v: OrderDraft[K]) => void;
  r: ReturnType<typeof calcResults>;
  onNext: () => void;
  disabled: boolean;
}) {
  const T = theme;
  return (
    <>
      <h1
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 40 : 64,
          margin: 0,
          letterSpacing: '-0.025em',
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        Berätta om <em style={{ fontStyle: 'italic', color: T.primary }}>er grupp</em>.
      </h1>
      <p style={{ fontSize: mobile ? 16 : 18, opacity: 0.75, maxWidth: 540, marginTop: 16 }}>
        Antalet säljare och tröjor avgör startpaketets storlek. Ni kan justera senare.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
          gap: mobile ? 20 : 32,
          marginTop: mobile ? 32 : 48,
        }}
      >
        <Field label="Vad heter gruppen?">
          <Input
            value={data.groupName}
            onChange={(v) => update('groupName', v)}
            placeholder="t.ex. 8B Norsborgsskolan"
          />
        </Field>
        <Field label="Vilken typ av grupp?">
          <Select
            value={data.groupType}
            onChange={(v) => update('groupType', v as OrderDraft['groupType'])}
            options={[
              { value: '', label: 'Välj…' },
              { value: 'klass', label: 'Klass / skola' },
              { value: 'lag', label: 'Lag / förening' },
              { value: 'forening', label: 'Annan förening' },
            ]}
          />
        </Field>
        <Field label="Vad är målet?" full>
          <Input
            value={data.goal}
            onChange={(v) => update('goal', v)}
            placeholder="t.ex. Klassresa till Berlin våren 2026"
          />
        </Field>
      </div>

      <div
        style={{
          marginTop: mobile ? 40 : 64,
          padding: mobile ? 24 : 40,
          background: T.fg,
          color: T.bg,
          borderRadius: 4,
        }}
      >
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: 0.55,
            marginBottom: 16,
          }}
        >
          Volym
        </div>
        <div style={{ marginBottom: 28 }}>
          <ThemedSlider
            label="Antal säljare"
            val={data.sellers}
            setVal={(v) => update('sellers', v)}
            min={5}
            max={60}
            accent={T.bg}
            track="rgba(244,239,230,0.18)"
            thumbBorder={T.bg}
            thumbFill={T.fg}
            tickColor="rgba(244,239,230,0.25)"
            valueFont={T.display}
            valueSize={mobile ? 48 : 64}
            suffix="elever"
          />
        </div>
        <ThemedSlider
          label="Tröjor per säljare"
          val={data.shirtsPer}
          setVal={(v) => update('shirtsPer', v)}
          min={2}
          max={20}
          accent={T.bg}
          track="rgba(244,239,230,0.18)"
          thumbBorder={T.bg}
          thumbFill={T.fg}
          tickColor="rgba(244,239,230,0.25)"
          valueFont={T.display}
          valueSize={mobile ? 48 : 64}
          suffix="st"
        />
        <div
          style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: '1px solid rgba(244,239,230,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              opacity: 0.55,
            }}
          >
            Beräknad nettovinst
          </div>
          <div
            style={{
              fontFamily: T.display,
              fontSize: mobile ? 48 : 72,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <CountUp value={r.profit} /> kr
          </div>
        </div>
      </div>

      <NavButtons mobile={mobile} onNext={onNext} disabled={disabled} />
    </>
  );
}

function Step2({
  mobile,
  data,
  update,
  onBack,
  onNext,
  disabled,
}: {
  mobile: boolean;
  data: OrderDraft;
  update: <K extends keyof OrderDraft>(k: K, v: OrderDraft[K]) => void;
  onBack: () => void;
  onNext: () => void;
  disabled: boolean;
}) {
  const T = theme;
  return (
    <>
      <h1
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 40 : 64,
          margin: 0,
          letterSpacing: '-0.025em',
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        Vem är <em style={{ fontStyle: 'italic', color: T.primary }}>kontaktperson</em>?
      </h1>
      <p style={{ fontSize: mobile ? 16 : 18, opacity: 0.75, maxWidth: 540, marginTop: 16 }}>
        Vi behöver en vuxen som kan ta emot startpaketet och svara på frågor.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
          gap: mobile ? 20 : 32,
          marginTop: mobile ? 32 : 48,
        }}
      >
        <Field label="Ditt namn">
          <Input value={data.contactName} onChange={(v) => update('contactName', v)} placeholder="Förnamn Efternamn" />
        </Field>
        <Field label="Roll i gruppen">
          <Input
            value={data.contactRole}
            onChange={(v) => update('contactRole', v)}
            placeholder="t.ex. lärare, lagledare, ordförande"
          />
        </Field>
        <Field label="E-post">
          <Input value={data.email} onChange={(v) => update('email', v)} placeholder="namn@skola.se" type="email" />
        </Field>
        <Field label="Telefon (mobil)">
          <Input value={data.phone} onChange={(v) => update('phone', v)} placeholder="070-123 45 67" type="tel" />
        </Field>
        <Field label="Leveransadress" full>
          <Input value={data.address} onChange={(v) => update('address', v)} placeholder="Skolgatan 12" />
        </Field>
        <Field label="Postnummer">
          <Input value={data.postal} onChange={(v) => update('postal', v)} placeholder="123 45" />
        </Field>
        <Field label="Ort">
          <Input value={data.city} onChange={(v) => update('city', v)} placeholder="Stockholm" />
        </Field>
      </div>

      <NavButtons mobile={mobile} onBack={onBack} onNext={onNext} disabled={disabled} />
    </>
  );
}

function Step3({
  mobile,
  data,
  update,
  r,
  onBack,
  onSubmit,
  submitting,
  error,
  disabled,
}: {
  mobile: boolean;
  data: OrderDraft;
  update: <K extends keyof OrderDraft>(k: K, v: OrderDraft[K]) => void;
  r: ReturnType<typeof calcResults>;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  disabled: boolean;
}) {
  const T = theme;
  return (
    <>
      <h1
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 40 : 64,
          margin: 0,
          letterSpacing: '-0.025em',
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        Verifiera och <em style={{ fontStyle: 'italic', color: T.primary }}>signera</em>.
      </h1>
      <p style={{ fontSize: mobile ? 16 : 18, opacity: 0.75, maxWidth: 540, marginTop: 16 }}>
        Bekräfta uppgifterna nedan. När ni är klara signerar kontaktpersonen med Mobilt BankID.
      </p>

      <div
        style={{
          marginTop: mobile ? 32 : 48,
          border: `1px solid ${T.fg}33`,
          padding: mobile ? 20 : 32,
          background: '#fff',
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
          gap: 20,
        }}
      >
        <Summary label="Grupp" value={`${data.groupName} (${data.groupType})`} T={T} />
        <Summary label="Mål" value={data.goal || '—'} T={T} />
        <Summary label="Säljare" value={`${data.sellers} st`} T={T} />
        <Summary label="Tröjor / säljare" value={`${data.shirtsPer} st`} T={T} />
        <Summary label="Total volym" value={`${r.totalShirts} tröjor`} T={T} />
        <Summary label="Beräknad nettovinst" value={`${formatSEK(r.profit)} kr`} T={T} highlight />
        <Summary label="Kontakt" value={`${data.contactName} · ${data.contactRole || '—'}`} T={T} />
        <Summary label="E-post / tel" value={`${data.email} · ${data.phone}`} T={T} />
        <Summary
          label="Adress"
          value={[data.address, [data.postal, data.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '—'}
          T={T}
          full
        />
      </div>

      <label
        style={{
          marginTop: mobile ? 24 : 32,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          fontSize: 14,
          lineHeight: 1.55,
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={data.acceptTerms}
          onChange={(e) => update('acceptTerms', e.target.checked)}
          style={{ marginTop: 4, width: 18, height: 18, accentColor: T.primary }}
        />
        <span>
          Jag är behörig att beställa för gruppens räkning och godkänner{' '}
          <a href="/villkor" style={{ color: T.primary }}>villkoren</a> samt{' '}
          <a href="/integritet" style={{ color: T.primary }}>integritetspolicyn</a>.
        </span>
      </label>

      {error && (
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
          {error}
        </div>
      )}

      <NavButtons
        mobile={mobile}
        onBack={onBack}
        onNext={onSubmit}
        disabled={disabled || submitting}
        nextLabel={submitting ? 'Skickar…' : 'Signera med BankID →'}
      />

      <div
        style={{
          marginTop: 16,
          fontFamily: T.mono,
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.muted,
        }}
      >
        ⚠ BankID-integration kommer i fas 2 — för nu sparas beställningen direkt.
      </div>
    </>
  );
}

function Step4({
  mobile,
  data,
  r,
}: {
  mobile: boolean;
  data: OrderDraft;
  r: ReturnType<typeof calcResults>;
}) {
  const T = theme;
  return (
    <div style={{ textAlign: 'center', padding: mobile ? '40px 0' : '80px 0' }}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.primary,
          marginBottom: 24,
        }}
      >
        ✓ Beställning mottagen
      </div>
      <h1
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 48 : 88,
          margin: 0,
          letterSpacing: '-0.025em',
          lineHeight: 1,
        }}
      >
        Tack, <em style={{ fontStyle: 'italic', color: T.primary }}>{data.contactName.split(' ')[0]}</em>!
      </h1>
      <p
        style={{
          fontSize: mobile ? 17 : 19,
          opacity: 0.78,
          maxWidth: 480,
          margin: '24px auto 0',
          lineHeight: 1.5,
        }}
      >
        Vi har tagit emot er beställning för <b>{data.groupName}</b>. Startpaketet med {r.totalShirts} tröjor
        skickas inom 3–5 dagar. Vi mejlar fraktinformation till {data.email}.
      </p>
      <div
        style={{
          marginTop: 48,
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(3, auto)',
          gap: mobile ? 16 : 48,
          padding: '24px 32px',
          border: `1px solid ${T.fg}33`,
        }}
      >
        {[
          ['Tröjor', `${r.totalShirts} st`],
          ['À pris', `${PRICE_PER_SHIRT} kr`],
          ['Vinst / tröja', `${PROFIT_PER_SHIRT} kr`],
        ].map(([l, v]) => (
          <div key={l}>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: T.muted,
              }}
            >
              {l}
            </div>
            <div style={{ fontFamily: T.display, fontSize: mobile ? 24 : 32 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div
        style={{
          fontFamily: theme.mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: theme.muted,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '14px 16px',
        fontSize: 16,
        fontFamily: theme.ui,
        border: `1px solid ${theme.fg}33`,
        background: '#fff',
        color: theme.fg,
        borderRadius: 4,
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '14px 16px',
        fontSize: 16,
        fontFamily: theme.ui,
        border: `1px solid ${theme.fg}33`,
        background: '#fff',
        color: theme.fg,
        borderRadius: 4,
        outline: 'none',
        boxSizing: 'border-box',
        appearance: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Summary({
  label,
  value,
  T,
  highlight,
  full,
}: {
  label: string;
  value: string;
  T: typeof theme;
  highlight?: boolean;
  full?: boolean;
}) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: T.muted,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: highlight ? T.display : T.ui,
          fontSize: highlight ? 32 : 16,
          color: highlight ? T.primary : T.fg,
          letterSpacing: highlight ? '-0.01em' : 'normal',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function NavButtons({
  mobile,
  onBack,
  onNext,
  disabled,
  nextLabel = 'Fortsätt →',
}: {
  mobile: boolean;
  onBack?: () => void;
  onNext: () => void;
  disabled: boolean;
  nextLabel?: string;
}) {
  const T = theme;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: mobile ? 32 : 48,
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: `1px solid ${T.fg}33`,
            color: T.fg,
            padding: '16px 28px',
            borderRadius: 999,
            fontSize: 15,
            fontFamily: T.ui,
            cursor: 'pointer',
          }}
        >
          ← Tillbaka
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        style={{
          background: T.primary,
          color: T.primaryFg,
          border: 'none',
          padding: '16px 28px',
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 500,
          fontFamily: T.ui,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

export default Bestall;
