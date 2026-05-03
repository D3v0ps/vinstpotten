import { Link } from 'react-router-dom';
import { useIsMobile } from '@/lib/useResponsive';
import { theme } from '@/theme';

export function NotFound() {
  const mobile = useIsMobile();
  const T = theme;
  return (
    <div
      style={{
        background: T.bg,
        color: T.fg,
        fontFamily: T.ui,
        minHeight: '60vh',
        padding: mobile ? '64px 24px' : '120px 80px',
        textAlign: 'center',
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
        404
      </div>
      <h1
        style={{
          fontFamily: T.display,
          fontSize: mobile ? 56 : 96,
          margin: 0,
          letterSpacing: '-0.025em',
          fontWeight: 400,
        }}
      >
        Sidan finns <em style={{ fontStyle: 'italic', color: T.primary }}>inte</em>.
      </h1>
      <p style={{ fontSize: mobile ? 16 : 19, opacity: 0.78, maxWidth: 480, margin: '24px auto 0', lineHeight: 1.5 }}>
        Länken är trasig eller så har sidan flyttats. Gå tillbaka till startsidan och försök igen.
      </p>
      <Link
        to="/"
        style={{
          marginTop: 32,
          display: 'inline-flex',
          background: T.primary,
          color: T.primaryFg,
          padding: '16px 28px',
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 500,
          textDecoration: 'none',
          alignItems: 'center',
          gap: 12,
        }}
      >
        Till startsidan
        <span style={{ fontFamily: T.display, fontSize: 22 }}>→</span>
      </Link>
    </div>
  );
}
