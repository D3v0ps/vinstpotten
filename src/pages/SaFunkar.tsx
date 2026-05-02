import { Link } from 'react-router-dom';
import { useIsMobile } from '@/lib/useResponsive';
import { theme } from '@/theme';

const STEPS = [
  {
    n: '01',
    title: 'Räkna ut potten',
    body: 'Två reglage på startsidan: antal säljare och tröjor per säljare. Resultatet uppdateras direkt så ni vet exakt vilken summa ni siktar på innan ni bokar mötet.',
    time: '60 sek',
  },
  {
    n: '02',
    title: 'Beställ startpaket',
    body: 'Tre fält, mobilt BankID. Ni får orderbekräftelse på mejl, packlista och säljmaterial. Inga avtal. Inga dolda kostnader.',
    time: '2 min',
  },
  {
    n: '03',
    title: 'Få startpaketet',
    body: 'Fri frakt. 3–5 dagars leverans. Tröjorna kommer i blandade storlekar (S–XXL) baserat på er volym, plus säljmaterial och en QR-länk till er säljarsida.',
    time: '3–5 dgr',
  },
  {
    n: '04',
    title: 'Sälj i klassen',
    body: 'Säljarna får tillgång till en personlig länk i Vinstpotten-appen där de markerar sålda tröjor. Föräldrar betalar via Swish eller på QR-länken. Vi följer upp utan att ni gör något.',
    time: '4 v',
  },
  {
    n: '05',
    title: 'Skicka tillbaka resten',
    body: 'Tröjorna ni inte sålt skickar ni tillbaka kostnadsfritt. Vi fakturerar bara det ni sålt – minus vår kostnad per tröja.',
    time: '5 dgr',
  },
  {
    n: '06',
    title: 'Ni får pengarna',
    body: 'Faktureringen sker när säljperioden är slut. Pengarna betalas till klassens / lagets konto inom 14 dagar.',
    time: '14 dgr',
  },
];

export function SaFunkar() {
  const mobile = useIsMobile();
  const T = theme;
  return (
    <div
      style={{
        background: T.bg,
        color: T.fg,
        fontFamily: T.ui,
        padding: mobile ? '32px 24px 80px' : '64px 80px 120px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
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
          Så funkar det · 06 steg · ca 6 veckor
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
          Räkna. <em style={{ fontStyle: 'italic', color: T.primary }}>Beställ.</em>
          <br />
          Sälj. Klart.
        </h1>
        <p
          style={{
            fontSize: mobile ? 17 : 20,
            opacity: 0.78,
            maxWidth: 600,
            marginTop: 32,
            lineHeight: 1.5,
          }}
        >
          Vi har redan tröjorna i lager här i Sverige. Hela processen tar i snitt sex veckor från att ni
          räknar potten till att pengarna landar.
        </p>

        <div
          style={{
            marginTop: mobile ? 48 : 96,
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : '1fr',
            gap: 0,
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              style={{
                display: 'grid',
                gridTemplateColumns: mobile ? '1fr' : '120px 1fr 120px',
                gap: mobile ? 8 : 32,
                padding: mobile ? '24px 0' : '32px 0',
                borderTop: `1px solid ${i === 0 ? T.fg : `${T.fg}1a`}`,
                alignItems: 'baseline',
              }}
            >
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: T.muted,
                  textTransform: 'uppercase',
                }}
              >
                Steg {s.n}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: mobile ? 30 : 40,
                    lineHeight: 1.05,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {s.title}
                </div>
                <p
                  style={{
                    fontSize: mobile ? 15 : 17,
                    opacity: 0.75,
                    lineHeight: 1.55,
                    marginTop: 12,
                    maxWidth: 620,
                  }}
                >
                  {s.body}
                </p>
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: T.primary,
                  textTransform: 'uppercase',
                  textAlign: mobile ? 'left' : 'right',
                }}
              >
                {s.time}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: mobile ? 64 : 96,
            background: T.fg,
            color: T.bg,
            padding: mobile ? 32 : 48,
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : '2fr 1fr',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                opacity: 0.55,
                marginBottom: 12,
              }}
            >
              Redo att börja?
            </div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: mobile ? 32 : 48,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              Räkna ut er pott och beställ startpaket — vi har det på torsdag.
            </div>
          </div>
          <Link
            to="/bestall"
            style={{
              background: T.bg,
              color: T.fg,
              padding: '20px 28px',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 500,
              fontFamily: T.ui,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              justifyContent: 'space-between',
            }}
          >
            Beställ startpaket
            <span style={{ fontFamily: T.display, fontSize: 22 }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
