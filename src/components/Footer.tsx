import { Link } from 'react-router-dom';
import { theme } from '@/theme';

interface Props {
  mobile: boolean;
}

export function Footer({ mobile }: Props) {
  const T = theme;
  return (
    <footer
      style={{
        borderTop: `1px solid ${T.fg}33`,
        padding: mobile ? '32px 24px' : '40px 80px',
        background: T.bg,
        color: T.fg,
        fontFamily: T.mono,
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(4, 1fr)',
          gap: mobile ? 24 : 48,
          marginBottom: mobile ? 24 : 40,
          color: T.muted,
        }}
      >
        <div>
          <div style={{ marginBottom: 10, color: T.fg, opacity: 0.8 }}>Vinstpotten</div>
          <div style={{ lineHeight: 1.8, textTransform: 'none', letterSpacing: 0, fontFamily: T.ui, fontSize: 13 }}>
            <Link to="/sa-funkar-det" style={{ display: 'block', color: T.muted }}>Så funkar det</Link>
            <Link to="/kollektioner" style={{ display: 'block', color: T.muted }}>Kollektioner</Link>
            <Link to="/berattelser" style={{ display: 'block', color: T.muted }}>Berättelser</Link>
            <Link to="/faq" style={{ display: 'block', color: T.muted }}>FAQ</Link>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 10, color: T.fg, opacity: 0.8 }}>För föreningar</div>
          <div style={{ lineHeight: 1.8, textTransform: 'none', letterSpacing: 0, fontFamily: T.ui, fontSize: 13 }}>
            <Link to="/bestall" style={{ display: 'block', color: T.muted }}>Beställ startpaket</Link>
            <Link to="/salj" style={{ display: 'block', color: T.muted }}>Säljardashboard</Link>
            <a href="mailto:hej@vinstpotten.se" style={{ display: 'block', color: T.muted }}>Kontakta oss</a>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 10, color: T.fg, opacity: 0.8 }}>Bolaget</div>
          <div style={{ lineHeight: 1.8, textTransform: 'none', letterSpacing: 0, fontFamily: T.ui, fontSize: 13 }}>
            <span style={{ display: 'block', color: T.muted }}>Vinstpotten AB</span>
            <span style={{ display: 'block', color: T.muted }}>Org 559123-4567</span>
            <span style={{ display: 'block', color: T.muted }}>Stockholm</span>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 10, color: T.fg, opacity: 0.8 }}>Juridik</div>
          <div style={{ lineHeight: 1.8, textTransform: 'none', letterSpacing: 0, fontFamily: T.ui, fontSize: 13 }}>
            <a href="/villkor" style={{ display: 'block', color: T.muted }}>Villkor</a>
            <a href="/integritet" style={{ display: 'block', color: T.muted }}>Integritetspolicy</a>
            <a href="/cookies" style={{ display: 'block', color: T.muted }}>Cookies</a>
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: T.muted,
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 24,
          borderTop: `1px solid ${T.fg}1a`,
        }}
      >
        <span>Vinstpotten AB · Org 559123-4567</span>
        <span>Stockholm · MMXXVI</span>
      </div>
    </footer>
  );
}
