import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemedSlider } from './ThemedSlider';
import { CountUp } from './CountUp';
import { calcResults, PRICE_PER_SHIRT, PROFIT_PER_SHIRT } from '@/lib/calculator';
import { theme } from '@/theme';

interface Props {
  mobile: boolean;
  /** Override defaults — used by Bestall flow to pre-fill from URL */
  initialSellers?: number;
  initialShirts?: number;
  /** Notify parent on changes — used by Bestall flow to pass values forward */
  onChange?: (sellers: number, shirtsPer: number) => void;
  /** CTA destination + label (defaults to /bestall) */
  ctaTo?: string;
  ctaLabel?: string;
}

export function Calculator({
  mobile,
  initialSellers = 24,
  initialShirts = 8,
  onChange,
  ctaTo = '/bestall',
  ctaLabel = 'Beställ startpaket — leverans nästa vecka',
}: Props) {
  const T = theme;
  const [sellers, setSellers] = useState(initialSellers);
  const [shirtsPer, setShirtsPer] = useState(initialShirts);
  const r = calcResults(sellers, shirtsPer);

  const updateSellers = (n: number) => {
    setSellers(n);
    onChange?.(n, shirtsPer);
  };
  const updateShirts = (n: number) => {
    setShirtsPer(n);
    onChange?.(sellers, n);
  };

  return (
    <div
      id="rakneverktyg"
      style={{
        background: T.fg,
        color: T.bg,
        borderRadius: 4,
        padding: mobile ? 28 : 48,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          opacity: 0.5,
          textTransform: 'uppercase',
        }}
      >
        Räkneverktyg / live
      </div>
      <div
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 22 : 26,
          fontStyle: 'italic',
          lineHeight: 1.2,
          maxWidth: 360,
          marginBottom: 36,
          marginTop: 8,
        }}
      >
        Räkna fram er klasskasse — dra i reglagen.
      </div>

      <div style={{ marginBottom: 32 }}>
        <ThemedSlider
          label="Antal säljare"
          val={sellers}
          setVal={updateSellers}
          min={5}
          max={60}
          accent={T.bg}
          track="rgba(244,239,230,0.18)"
          thumbBorder={T.bg}
          thumbFill={T.fg}
          tickColor="rgba(244,239,230,0.25)"
          valueFont={T.display}
          valueSize={mobile ? 56 : 80}
          suffix="elever"
        />
      </div>
      <div style={{ marginBottom: 40 }}>
        <ThemedSlider
          label="Tröjor per säljare"
          val={shirtsPer}
          setVal={updateShirts}
          min={2}
          max={20}
          accent={T.bg}
          track="rgba(244,239,230,0.18)"
          thumbBorder={T.bg}
          thumbFill={T.fg}
          tickColor="rgba(244,239,230,0.25)"
          valueFont={T.display}
          valueSize={mobile ? 56 : 80}
          suffix="st"
        />
      </div>

      <div style={{ borderTop: '1px solid rgba(244,239,230,0.2)', paddingTop: 28 }}>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: 0.55,
            marginBottom: 8,
          }}
        >
          Beräknad nettovinst till klassen
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: T.display,
              fontSize: mobile ? 64 : 96,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <CountUp value={r.profit} />
          </span>
          <span style={{ fontFamily: T.display, fontSize: mobile ? 28 : 40, opacity: 0.6 }}>kr</span>
        </div>
        <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 28 }}>
          {r.totalShirts} tröjor · à {PRICE_PER_SHIRT} kr ·{' '}
          {Math.round((PROFIT_PER_SHIRT / PRICE_PER_SHIRT) * 100)}% vinst per såld tröja
        </div>

        <Link
          to={`${ctaTo}?sellers=${sellers}&shirts=${shirtsPer}`}
          style={{
            background: T.bg,
            color: T.fg,
            border: 'none',
            width: '100%',
            padding: '20px 24px',
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 500,
            fontFamily: T.ui,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          <span>{ctaLabel}</span>
          <span style={{ fontFamily: T.display, fontSize: 22 }}>→</span>
        </Link>
      </div>
    </div>
  );
}
