import { Link, NavLink } from 'react-router-dom';
import { theme } from '@/theme';

interface Props {
  mobile: boolean;
}

const NAV = [
  { to: '/sa-funkar-det', label: 'Så funkar det' },
  { to: '/kollektioner', label: 'Kollektioner' },
  { to: '/#rakneverktyg', label: 'Räkneverktyg' },
  { to: '/berattelser', label: 'Berättelser' },
  { to: '/faq', label: 'FAQ' },
];

export function Header({ mobile }: Props) {
  const T = theme;
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: mobile ? '20px 24px' : '28px 80px',
        borderBottom: `1px solid ${T.fg}1a`,
        gap: 16,
        flexWrap: 'wrap',
        background: T.bg,
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: T.fg,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: T.primary,
            display: 'grid',
            placeItems: 'center',
            color: T.primaryFg,
            fontFamily: T.display,
            fontSize: 18,
            fontStyle: 'italic',
          }}
        >
          v
        </div>
        <span style={{ fontFamily: T.display, fontSize: mobile ? 22 : 24, letterSpacing: '-0.02em' }}>
          Vinstpotten
        </span>
      </Link>
      {!mobile && (
        <nav style={{ display: 'flex', gap: 32, fontSize: 14 }}>
          {NAV.map((item) =>
            item.to.startsWith('/#') ? (
              <a
                key={item.to}
                href={item.to.slice(1)}
                style={{ color: T.fg, textDecoration: 'none', opacity: 0.8 }}
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  color: T.fg,
                  textDecoration: 'none',
                  opacity: isActive ? 1 : 0.8,
                  fontWeight: isActive ? 500 : 400,
                })}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {!mobile && (
          <Link to="/salj" style={{ fontSize: 14, opacity: 0.8, textDecoration: 'none', color: T.fg }}>
            Logga in
          </Link>
        )}
        <Link
          to="/bestall"
          style={{
            background: T.primary,
            color: T.primaryFg,
            border: 'none',
            padding: mobile ? '10px 14px' : '12px 20px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: T.ui,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          Beställ startpaket →
        </Link>
      </div>
    </header>
  );
}
