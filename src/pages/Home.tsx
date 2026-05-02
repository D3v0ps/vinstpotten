import { Link } from 'react-router-dom';
import { Calculator } from '@/components/Calculator';
import { Marquee } from '@/components/Marquee';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { useIsMobile } from '@/lib/useResponsive';
import { CASES } from '@/lib/cases';
import { theme } from '@/theme';

const STEPS: [string, string, string][] = [
  ['01', 'Räkna ut potten', 'Två reglage, en summa. Bestäm volymen innan ni bokar mötet.'],
  ['02', 'Beställ startpaket', 'Tre steg, mobilt BankID. Klart på två minuter.'],
  ['03', 'Sälj i klassen', 'Tröjorna kommer på fem dagar. Säljmaterial och QR-länk följer med.'],
  ['04', 'Ni får pengarna', 'Vi fakturerar bara det ni säljer. Resten skickar ni tillbaka utan kostnad.'],
];

export function Home() {
  const mobile = useIsMobile();
  const T = theme;

  return (
    <div
      style={{
        background: T.bg,
        color: T.fg,
        fontFamily: T.ui,
        fontSize: mobile ? 15 : 16,
        lineHeight: 1.5,
        letterSpacing: '-0.01em',
      }}
    >
      <section
        style={{
          padding: mobile ? '40px 24px 60px' : '80px 80px 100px',
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 1.1fr',
          gap: mobile ? 40 : 80,
          alignItems: 'start',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: T.muted,
              marginBottom: 32,
            }}
          >
            <span style={{ width: 24, height: 1, background: T.muted }} />
            Sedan 2019 · 2 400 grupper hjälpta
          </div>
          <h1
            style={{
              fontFamily: T.display,
              fontSize: mobile ? 56 : 96,
              lineHeight: 0.95,
              margin: 0,
              fontWeight: 400,
              letterSpacing: '-0.025em',
            }}
          >
            Klassresan,
            <br />
            <em style={{ fontStyle: 'italic', color: T.primary }}>finansierad</em>
            <br />
            på en vecka.
          </h1>
          <p
            style={{
              fontSize: mobile ? 17 : 19,
              lineHeight: 1.5,
              color: T.fg,
              opacity: 0.78,
              maxWidth: 460,
              marginTop: 32,
            }}
          >
            Vi har redan tröjorna i lager. Ni får ett startpaket på fem dagar, säljer i klassen, lämnar in
            pengarna. Ingen designavgift, inga dolda kostnader, inget krångel.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
            {[
              ['3–5 dgr', 'leveranstid'],
              ['62%', 'genomsnittlig vinstmarginal'],
              ['0 kr', 'designavgift'],
            ].map(([n, l], i) => (
              <div key={i} style={{ borderTop: `1px solid ${T.fg}33`, paddingTop: 12, minWidth: 100 }}>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: mobile ? 32 : 40,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    marginTop: 6,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Calculator mobile={mobile} />
      </section>

      <Marquee mobile={mobile} />

      <section style={{ padding: mobile ? '60px 24px' : '120px 80px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: mobile ? 32 : 64,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <h2
            style={{
              fontFamily: T.display,
              fontSize: mobile ? 40 : 64,
              margin: 0,
              letterSpacing: '-0.02em',
              fontWeight: 400,
            }}
          >
            Så <em style={{ fontStyle: 'italic', color: T.primary }}>funkar</em> det.
          </h2>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: '0.16em',
              color: T.muted,
              textTransform: 'uppercase',
            }}
          >
            04 steg · ca 6 veckor
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'repeat(4, 1fr)',
            gap: mobile ? 32 : 0,
          }}
        >
          {STEPS.map(([n, t, d], i) => (
            <div
              key={i}
              style={{
                borderTop: `1px solid ${T.fg}`,
                padding: '24px 24px 32px 0',
                borderRight: !mobile && i < 3 ? `1px solid ${T.fg}1a` : 'none',
                paddingLeft: !mobile && i > 0 ? 24 : 0,
              }}
            >
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: T.muted,
                  marginBottom: 32,
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontFamily: T.display,
                  fontSize: mobile ? 26 : 28,
                  lineHeight: 1.1,
                  marginBottom: 14,
                  letterSpacing: '-0.01em',
                }}
              >
                {t}
              </div>
              <div style={{ fontSize: 14, color: T.fg, opacity: 0.7, lineHeight: 1.55 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: T.fg, color: T.bg, padding: mobile ? '60px 0' : '120px 0' }}>
        <div
          style={{
            padding: mobile ? '0 24px 32px' : '0 80px 64px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              opacity: 0.55,
            }}
          >
            Berättelse Nº 047 — 8B Norsborgsskolan
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              opacity: 0.55,
            }}
          >
            Stockholm · våren 2025
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : '1.2fr 1fr',
            gap: 0,
            alignItems: 'stretch',
          }}
        >
          <PhotoPlaceholder
            label="412 tröjor sålda · klassfoto"
            tone="dark"
            style={{ minHeight: mobile ? 320 : 600 }}
          />
          <div
            style={{
              padding: mobile ? '40px 24px' : '60px 80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: mobile ? 'auto' : 600,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: T.display,
                  fontSize: mobile ? 44 : 80,
                  lineHeight: 0.95,
                  letterSpacing: '-0.02em',
                }}
              >
                28 748 kr
                <br />
                <span style={{ fontStyle: 'italic', opacity: 0.55, fontSize: '0.55em' }}>
                  till klassresan,
                  <br />
                  Berlin '25.
                </span>
              </div>
              <p
                style={{
                  fontSize: mobile ? 17 : 19,
                  lineHeight: 1.45,
                  marginTop: 32,
                  opacity: 0.85,
                  maxWidth: 420,
                }}
              >
                "Vi sålde slut på fyra veckor. Tröjorna fanns hemma redan veckan vi bokade. Mormor köpte tre."
              </p>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  marginTop: 20,
                  opacity: 0.55,
                  textTransform: 'uppercase',
                }}
              >
                — Mira, klassrepresentant
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 32,
                marginTop: 48,
                paddingTop: 24,
                borderTop: '1px solid rgba(244,239,230,0.2)',
              }}
            >
              {[
                ['Tröjor', '412'],
                ['Säljperiod', '4 v'],
                ['Marginal', '62%'],
              ].map(([l, v]) => (
                <div key={l}>
                  <div
                    style={{
                      fontFamily: T.mono,
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      opacity: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    {l}
                  </div>
                  <div style={{ fontFamily: T.display, fontSize: 36 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: mobile ? '40px 24px 0' : '64px 80px 0',
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
            gap: mobile ? 32 : 48,
          }}
        >
          {CASES.slice(1).map((c) => (
            <Link
              key={c.klass}
              to="/berattelser"
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 20,
                alignItems: 'start',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <PhotoPlaceholder label={c.klass.split('·')[0].trim()} tone="dark" style={{ height: 120 }} />
              <div>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    opacity: 0.5,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  {c.where} · {c.shirts} tröjor
                </div>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: 32,
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {c.summa.toLocaleString('sv-SE')} kr
                </div>
                <div style={{ fontSize: 14, opacity: 0.65, marginTop: 8 }}>{c.goal}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: mobile ? '60px 24px' : '120px 80px',
          textAlign: 'center',
          background: T.bg,
        }}
      >
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
          Två minuter, inte två veckor
        </div>
        <h2
          style={{
            fontFamily: T.display,
            fontSize: mobile ? 48 : 96,
            margin: 0,
            fontWeight: 400,
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}
        >
          Beställ ert <em style={{ color: T.primary, fontStyle: 'italic' }}>startpaket</em>
          <br />
          så har ni det på torsdag.
        </h2>
        <Link
          to="/bestall"
          style={{
            marginTop: 48,
            background: T.primary,
            color: T.primaryFg,
            border: 'none',
            padding: '24px 40px',
            borderRadius: 999,
            fontSize: 17,
            fontWeight: 500,
            fontFamily: T.ui,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            textDecoration: 'none',
          }}
        >
          Beställ startpaket
          <span style={{ fontFamily: T.display, fontSize: 22 }}>→</span>
        </Link>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 18 }}>
          Verifieras med Mobilt BankID · ingen bindningstid · inget förskott
        </div>
      </section>
    </div>
  );
}
