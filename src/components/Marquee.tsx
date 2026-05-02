import { theme } from '@/theme';

interface Props {
  mobile: boolean;
}

const NAMES = [
  'Norsborgsskolan 8B',
  'IK Brage P14',
  'Hammarö ridklubb',
  'Mariaskolan 6A',
  'Sirius F12',
  'Halmstads BK U16',
  'Kullaviks ridklubb',
];

export function Marquee({ mobile }: Props) {
  const T = theme;
  return (
    <div
      style={{
        borderTop: `1px solid ${T.fg}1a`,
        borderBottom: `1px solid ${T.fg}1a`,
        padding: '20px 0',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontFamily: T.display,
        fontSize: mobile ? 24 : 32,
        fontStyle: 'italic',
        background: T.bg,
        color: T.fg,
      }}
    >
      <div style={{ display: 'inline-flex', gap: 56, paddingLeft: mobile ? 24 : 80 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} style={{ display: 'inline-flex', gap: 56, alignItems: 'center' }}>
            {NAMES.map((n, j) => (
              <span key={j} style={{ display: 'inline-flex', gap: 56, alignItems: 'center' }}>
                <span>{n}</span>
                <span style={{ color: T.muted }}>·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
