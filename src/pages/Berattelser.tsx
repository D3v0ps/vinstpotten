import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { CASES } from '@/lib/cases';
import { useIsMobile } from '@/lib/useResponsive';
import { theme } from '@/theme';

export function Berattelser() {
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
          Berättelser · 2 400+ grupper sedan 2019
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
          De som redan
          <br />
          <em style={{ fontStyle: 'italic', color: T.primary }}>fyllde kassan</em>.
        </h1>

        <div style={{ marginTop: mobile ? 48 : 80, display: 'flex', flexDirection: 'column', gap: mobile ? 48 : 96 }}>
          {CASES.map((c, i) => (
            <article
              key={c.klass}
              style={{
                display: 'grid',
                gridTemplateColumns: mobile ? '1fr' : i % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr',
                gap: mobile ? 24 : 64,
                alignItems: 'center',
              }}
            >
              <PhotoPlaceholder
                label={c.klass}
                tone={i === 0 ? 'plum' : 'warm'}
                style={{ aspectRatio: '4/3', width: '100%' }}
              />
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
                  {c.where} · {c.shirts} tröjor sålda
                </div>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: mobile ? 32 : 48,
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    fontStyle: 'italic',
                  }}
                >
                  "{c.quote}"
                </div>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: T.muted,
                    marginTop: 16,
                  }}
                >
                  — {c.person} · {c.klass}
                </div>
                <div
                  style={{
                    marginTop: 32,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    borderTop: `1px solid ${T.fg}33`,
                    borderBottom: `1px solid ${T.fg}33`,
                  }}
                >
                  {[
                    ['Tröjor', `${c.shirts} st`],
                    ['Vinst', `${c.summa.toLocaleString('sv-SE')} kr`],
                    ['Mål', c.goal],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      style={{
                        padding: '20px 4px',
                        borderRight: l !== 'Mål' ? `1px solid ${T.fg}1a` : 'none',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: T.mono,
                          fontSize: 9,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: T.muted,
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          fontFamily: T.display,
                          fontSize: mobile ? 22 : 28,
                          marginTop: 4,
                          letterSpacing: '-0.01em',
                          lineHeight: 1.1,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
