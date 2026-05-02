import { Link } from 'react-router-dom';
import { Tee } from '@/components/Tee';
import { useIsMobile } from '@/lib/useResponsive';
import { theme } from '@/theme';

interface Collection {
  slug: string;
  name: string;
  tag: string;
  tee: string;
  print: string;
  textC: string;
  description: string;
}

const COLLECTIONS: Collection[] = [
  {
    slug: 'klass-edition',
    name: 'Klass-edition',
    tag: 'Bestseller',
    tee: '#F4EFE6',
    print: 'Klass av 2026',
    textC: '#191613',
    description: 'Klassisk t-shirt med tryck på framsidan. Anpassningsbar med klass och årskull.',
  },
  {
    slug: 'lag-edition',
    name: 'Lag-edition',
    tag: '128 st kvar',
    tee: '#3F2742',
    print: 'för laget.',
    textC: '#F4EFE6',
    description: 'Plommon-tröja för lag. Sportkrage, premium-jersey, tryck på rygg och bröst.',
  },
  {
    slug: 'forenings-edition',
    name: 'Förenings-edition',
    tag: 'Ny',
    tee: '#7A4A2E',
    print: 'tillsammans',
    textC: '#F4EFE6',
    description: 'För föreningar. Egen logga eller text — vi hjälper er att digitalisera om ni saknar.',
  },
  {
    slug: 'studentbal',
    name: 'Studentbal',
    tag: 'Säsong',
    tee: '#2D3F2D',
    print: '— studenter —',
    textC: '#D4F25E',
    description: 'Studentbal-edition. Tre färger, tre storlekar. Snabbleverans till studentbalen.',
  },
  {
    slug: 'cup-edition',
    name: 'Cup-edition',
    tag: 'Snabbsäljare',
    tee: '#191613',
    print: 'cuplaget',
    textC: '#F4EFE6',
    description: 'För cuplag. Korta deadlines, kvällsutskick, perfekt för Gothia, Helsinki och Eskilstuna Cup.',
  },
  {
    slug: 'skolavslutning',
    name: 'Skolavslutning',
    tag: 'Begränsat',
    tee: '#5A3F2E',
    print: 'klar 2026',
    textC: '#F4EFE6',
    description: 'Mjuk och tjock kvalitet. Tryck med klass och årtal. Limiterad upplaga.',
  },
];

export function Kollektioner() {
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
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
          06 kollektioner · alla i lager
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
          Sex <em style={{ fontStyle: 'italic', color: T.primary }}>kollektioner</em>
          <br />
          redan i lager.
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
          Vi designar inte fram nya tröjor varje gång — vi har redan plaggen i lager. Det betyder 3–5
          dagars leverans i stället för 14 dagars katalogvänta. 249 kr per tröja, 154 kr i vinst till er.
        </p>

        <div
          style={{
            marginTop: mobile ? 48 : 80,
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: mobile ? 16 : 32,
          }}
        >
          {COLLECTIONS.map((p) => (
            <Link
              key={p.slug}
              to={`/kollektioner/${p.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  background: '#F8F4EA',
                  aspectRatio: '4/5',
                  display: 'grid',
                  placeItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Tee fill={p.tee} size={mobile ? 140 : 220} print={p.print} printColor={p.textC} />
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    fontFamily: T.mono,
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    background: T.fg,
                    color: T.bg,
                    padding: '4px 8px',
                  }}
                >
                  {p.tag}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: 14,
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: mobile ? 18 : 24,
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 12, opacity: 0.7 }}>249 kr</div>
              </div>
              {!mobile && (
                <div style={{ fontSize: 14, opacity: 0.65, marginTop: 8, lineHeight: 1.5 }}>{p.description}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
