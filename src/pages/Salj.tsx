import { useEffect, useState, type FormEvent } from 'react';
import { supabase, type Session } from '@/lib/supabase';
import { useIsMobile } from '@/lib/useResponsive';
import { theme } from '@/theme';
import { formatSEK, PROFIT_PER_SHIRT } from '@/lib/calculator';

interface OrderRow {
  id: string;
  group_name: string;
  group_type: string;
  sellers: number;
  shirts_per_seller: number;
  total_shirts: number;
  estimated_profit: number;
  status: 'draft' | 'paid' | 'shipped' | 'selling' | 'completed' | 'cancelled';
  shirts_sold: number | null;
  created_at: string;
}

export function Salj() {
  const mobile = useIsMobile();
  const T = theme;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
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
        {session ? <Dashboard session={session} mobile={mobile} /> : <SignIn mobile={mobile} />}
      </div>
    </div>
  );
}

function SignIn({ mobile }: { mobile: boolean }) {
  const T = theme;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/salj' },
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
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.muted,
          marginBottom: 24,
        }}
      >
        Säljardashboard
      </div>
      <h1
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 48 : 72,
          lineHeight: 0.95,
          margin: 0,
          fontWeight: 400,
          letterSpacing: '-0.025em',
        }}
      >
        Logga in
      </h1>
      <p style={{ fontSize: mobile ? 16 : 18, opacity: 0.78, marginTop: 24, lineHeight: 1.5 }}>
        Vi skickar en magisk länk till mejlen. Klicka i mejlet — du loggas in utan lösenord.
        BankID-inloggning kommer i fas 2.
      </p>

      <form onSubmit={submit} style={{ marginTop: 32 }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="namn@skola.se"
          disabled={status === 'sending' || status === 'sent'}
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: 16,
            fontFamily: T.ui,
            border: `1px solid ${T.fg}33`,
            background: '#fff',
            color: T.fg,
            borderRadius: 4,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={status === 'sending' || status === 'sent'}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '16px 20px',
            background: T.primary,
            color: T.primaryFg,
            border: 'none',
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 500,
            fontFamily: T.ui,
            cursor: status === 'sending' || status === 'sent' ? 'wait' : 'pointer',
            opacity: status === 'sending' || status === 'sent' ? 0.6 : 1,
          }}
        >
          {status === 'sending' ? 'Skickar…' : status === 'sent' ? '✓ Skickad — kolla mejlen' : 'Skicka magisk länk →'}
        </button>
      </form>

      {status === 'error' && (
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
          {errorMsg}
        </div>
      )}
    </div>
  );
}

function Dashboard({ session, mobile }: { session: Session; mobile: boolean }) {
  const T = theme;
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('orders')
      .select('*')
      .eq('email', session.user.email)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderRow[]) ?? []);
        setLoading(false);
      });
  }, [session.user.email]);

  const totalEstimated = orders.reduce((sum, o) => sum + (o.estimated_profit || 0), 0);
  const totalSold = orders.reduce((sum, o) => sum + (o.shirts_sold || 0), 0);
  const totalEarned = totalSold * PROFIT_PER_SHIRT;

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
            Inloggad som {session.user.email}
          </div>
          <h1
            style={{
              fontFamily: T.display,
              fontSize: mobile ? 40 : 64,
              margin: 0,
              fontWeight: 400,
              letterSpacing: '-0.025em',
            }}
          >
            Era <em style={{ fontStyle: 'italic', color: T.primary }}>säljkampanjer</em>.
          </h1>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            background: 'transparent',
            border: `1px solid ${T.fg}33`,
            color: T.fg,
            padding: '12px 20px',
            borderRadius: 999,
            fontSize: 13,
            fontFamily: T.ui,
            cursor: 'pointer',
          }}
        >
          Logga ut
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 0,
          border: `1px solid ${T.fg}33`,
          marginBottom: mobile ? 32 : 48,
        }}
      >
        <Stat label="Beräknat netto (allt)" value={`${formatSEK(totalEstimated)} kr`} T={T} mobile={mobile} />
        <Stat label="Sålt hittills" value={`${totalSold} tröjor`} T={T} mobile={mobile} border />
        <Stat label="Vinst hittills" value={`${formatSEK(totalEarned)} kr`} T={T} mobile={mobile} border highlight />
      </div>

      {loading ? (
        <div style={{ color: T.muted, fontFamily: T.mono, fontSize: 12, padding: 32, textAlign: 'center' }}>
          Laddar kampanjer…
        </div>
      ) : orders.length === 0 ? (
        <EmptyState mobile={mobile} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} T={T} mobile={mobile} />
          ))}
        </div>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  T,
  mobile,
  border,
  highlight,
}: {
  label: string;
  value: string;
  T: typeof theme;
  mobile: boolean;
  border?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: mobile ? '20px 24px' : '32px 40px',
        borderTop: mobile && border ? `1px solid ${T.fg}33` : 'none',
        borderLeft: !mobile && border ? `1px solid ${T.fg}33` : 'none',
        background: highlight ? T.fg : 'transparent',
        color: highlight ? T.bg : T.fg,
      }}
    >
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          opacity: 0.65,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 36 : 48,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function OrderCard({ order, T, mobile }: { order: OrderRow; T: typeof theme; mobile: boolean }) {
  const sold = order.shirts_sold || 0;
  const pct = order.total_shirts > 0 ? Math.round((sold / order.total_shirts) * 100) : 0;
  return (
    <div
      style={{
        padding: mobile ? '24px 0' : '32px 0',
        borderTop: `1px solid ${T.fg}1a`,
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '2fr 1fr 1fr 1fr',
        gap: mobile ? 12 : 24,
        alignItems: 'baseline',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: T.muted,
            marginBottom: 6,
          }}
        >
          {order.group_type} · {new Date(order.created_at).toLocaleDateString('sv-SE')}
        </div>
        <div style={{ fontFamily: T.display, fontSize: mobile ? 24 : 28, lineHeight: 1.1 }}>{order.group_name}</div>
      </div>
      <div>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.muted,
          }}
        >
          Sålt
        </div>
        <div style={{ fontFamily: T.display, fontSize: 22 }}>
          {sold}/{order.total_shirts} ({pct}%)
        </div>
      </div>
      <div>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.muted,
          }}
        >
          Vinst hittills
        </div>
        <div style={{ fontFamily: T.display, fontSize: 22 }}>
          {formatSEK(sold * PROFIT_PER_SHIRT)} kr
        </div>
      </div>
      <div>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: order.status === 'completed' ? T.primary : `${T.fg}10`,
            color: order.status === 'completed' ? T.primaryFg : T.fg,
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            borderRadius: 999,
          }}
        >
          {order.status}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ mobile }: { mobile: boolean }) {
  const T = theme;
  return (
    <div
      style={{
        padding: mobile ? 40 : 64,
        background: '#fff',
        border: `1px dashed ${T.fg}33`,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 28 : 36,
          letterSpacing: '-0.02em',
          marginBottom: 16,
        }}
      >
        Inga kampanjer än.
      </div>
      <p style={{ fontSize: mobile ? 15 : 17, opacity: 0.7, maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
        Beställ ert första startpaket så ser ni säljstatistiken här när tröjorna går ut.
      </p>
      <a
        href="/bestall"
        style={{
          display: 'inline-block',
          marginTop: 24,
          background: T.primary,
          color: T.primaryFg,
          padding: '14px 24px',
          borderRadius: 999,
          fontSize: 14,
          textDecoration: 'none',
          fontFamily: T.ui,
        }}
      >
        Beställ startpaket →
      </a>
    </div>
  );
}

export default Salj;
