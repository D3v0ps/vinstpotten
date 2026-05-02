import { useState } from 'react';
import { useIsMobile } from '@/lib/useResponsive';
import { theme } from '@/theme';

interface QA {
  q: string;
  a: string;
}

const FAQ: { section: string; items: QA[] }[] = [
  {
    section: 'Beställning & leverans',
    items: [
      {
        q: 'Hur lång tid tar leveransen?',
        a: 'Vi skickar startpaketet samma dag som ni beställer. Med PostNord MyPack är det normalt 3–5 dagar till en utlämningsplats. Express-leverans 1–2 dagar finns vid behov.',
      },
      {
        q: 'Vilka storlekar kommer i startpaketet?',
        a: 'Vi packar utifrån svensk skol-/lag-statistik: ungefär 15% S, 30% M, 30% L, 20% XL och 5% XXL. Ni kan begära annan fördelning vid beställning.',
      },
      {
        q: 'Kan vi ändra antal efteråt?',
        a: 'Ja. Lägg till med ett mejl till hej@vinstpotten.se. Tröjor som blir över skickar ni tillbaka kostnadsfritt — vi fakturerar bara det som faktiskt sålts.',
      },
    ],
  },
  {
    section: 'Pengar & marginal',
    items: [
      {
        q: 'Hur mycket går till klassen?',
        a: 'Tröjan kostar 95 kr för Vinstpotten och säljs för 249 kr. Det blir 154 kr i vinst per såld tröja, vilket är 62% marginal. Med 24 säljare och 8 tröjor var blir det 29 568 kr netto.',
      },
      {
        q: 'Finns det dolda avgifter?',
        a: 'Nej. Inget förskott, ingen designavgift, ingen frakt på startpaketet eller returen. Ni betalar bara 95 kr per såld tröja.',
      },
      {
        q: 'När får vi pengarna?',
        a: 'Faktureringen sker efter säljperioden. Pengarna betalas till klass-/lagkontot inom 14 dagar efter att ni rapporterat in slutsiffrorna.',
      },
    ],
  },
  {
    section: 'Säljarsida & app',
    items: [
      {
        q: 'Hur säljer vi tröjorna?',
        a: 'Varje säljare får en personlig QR-länk till en säljarsida där föräldrar och vänner kan beställa direkt eller markera Swish-betalning. Säljaren har koll på sina egna siffror i en mobil dashboard.',
      },
      {
        q: 'Behöver alla en app?',
        a: 'Nej. QR-koden öppnar säljarsidan i webbläsaren. Bara kontaktpersonen behöver logga in i Vinstpotten-dashboarden.',
      },
    ],
  },
  {
    section: 'Övrigt',
    items: [
      {
        q: 'Vilka krav finns?',
        a: 'Ni måste vara minst 5 säljare och beställa minst 50 tröjor. Det går bra med klass, lag, kör, scoutkår eller vilken organiserad grupp som helst.',
      },
      {
        q: 'Hur är kvaliteten?',
        a: 'Vi använder Stanley/Stella Creator unisex i 100% ekologisk bomull, 180 g. Tryck med screen- eller direct-to-garment beroende på upplaga.',
      },
      {
        q: 'Vad händer om vi inte säljer allt?',
        a: 'Skicka tillbaka resten kostnadsfritt med returetiketten som följer med. Inga frågor. Vi fakturerar bara det ni sålt.',
      },
    ],
  },
];

export function Faq() {
  const mobile = useIsMobile();
  const T = theme;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div
      style={{
        background: T.bg,
        color: T.fg,
        fontFamily: T.ui,
        padding: mobile ? '32px 24px 80px' : '64px 80px 120px',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
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
          FAQ · vanliga frågor
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
          Frågor & <em style={{ fontStyle: 'italic', color: T.primary }}>svar</em>.
        </h1>

        <div style={{ marginTop: mobile ? 48 : 80 }}>
          {FAQ.map((sec) => (
            <section key={sec.section} style={{ marginBottom: mobile ? 48 : 64 }}>
              <h2
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: T.muted,
                  borderBottom: `1px solid ${T.fg}`,
                  paddingBottom: 12,
                  marginBottom: 0,
                }}
              >
                {sec.section}
              </h2>
              {sec.items.map((item) => {
                const id = `${sec.section}-${item.q}`;
                const isOpen = open === id;
                return (
                  <div key={item.q} style={{ borderBottom: `1px solid ${T.fg}1a` }}>
                    <button
                      onClick={() => setOpen(isOpen ? null : id)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '20px 0',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: T.display,
                          fontSize: mobile ? 20 : 26,
                          lineHeight: 1.2,
                          letterSpacing: '-0.01em',
                          color: T.fg,
                        }}
                      >
                        {item.q}
                      </span>
                      <span
                        style={{
                          fontFamily: T.display,
                          fontSize: 24,
                          color: T.primary,
                          flexShrink: 0,
                          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                          transition: 'transform .2s',
                        }}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <p
                        style={{
                          fontSize: mobile ? 15 : 17,
                          opacity: 0.78,
                          lineHeight: 1.55,
                          margin: 0,
                          padding: '0 0 24px',
                          maxWidth: 700,
                        }}
                      >
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
