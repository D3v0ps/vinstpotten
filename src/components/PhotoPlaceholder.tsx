import type { CSSProperties } from 'react';

interface Props {
  label?: string;
  tone?: 'warm' | 'dark' | 'plum';
  style?: CSSProperties;
}

export function PhotoPlaceholder({ label = 'CLASS PHOTO', tone = 'warm', style = {} }: Props) {
  const stripes =
    tone === 'dark'
      ? 'repeating-linear-gradient(135deg, #1a1612 0 12px, #221d18 12px 24px)'
      : tone === 'plum'
        ? 'repeating-linear-gradient(135deg, #3a2a3e 0 12px, #432f47 12px 24px)'
        : 'repeating-linear-gradient(135deg, #e3ddd0 0 12px, #ddd6c7 12px 24px)';
  const text = tone === 'warm' ? '#7a6a5a' : 'rgba(255,255,255,0.55)';
  return (
    <div
      style={{
        background: stripes,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 11,
          color: text,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.04)',
          padding: '6px 10px',
          borderRadius: 4,
          backdropFilter: 'blur(2px)',
        }}
      >
        ↳ {label}
      </span>
    </div>
  );
}
