import { useRef } from 'react';
import { CountUp } from './CountUp';

interface Props {
  label: string;
  val: number;
  setVal: (n: number) => void;
  min: number;
  max: number;
  suffix?: string;
  accent?: string;
  track?: string;
  thumbBorder?: string;
  thumbFill?: string;
  tickColor?: string;
  valueFont?: string;
  valueSize?: number;
  ticks?: number;
}

export function ThemedSlider({
  label,
  val,
  setVal,
  min,
  max,
  suffix,
  accent = '#000',
  track = '#e5e0d6',
  thumbBorder = '#000',
  thumbFill = '#fff',
  tickColor = 'rgba(0,0,0,0.18)',
  valueFont = 'inherit',
  valueSize = 56,
  ticks,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const set = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return;
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setVal(Math.round(min + t * (max - min)));
  };

  const pct = ((val - min) / (max - min)) * 100;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 14,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            opacity: 0.65,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: valueFont,
            fontSize: valueSize,
            lineHeight: 1,
            fontWeight: 400,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <CountUp value={val} duration={180} format={(n) => n.toString()} />
          {suffix && (
            <span style={{ fontSize: valueSize * 0.4, marginLeft: 6, opacity: 0.55 }}>
              {suffix}
            </span>
          )}
        </span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          set(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) set(e.clientX);
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          e.currentTarget.releasePointerCapture?.(e.pointerId);
        }}
        style={{
          position: 'relative',
          height: 44,
          cursor: 'pointer',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 21,
            left: 0,
            right: 0,
            height: 2,
            background: track,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 21,
            left: 0,
            width: `${pct}%`,
            height: 2,
            background: accent,
            borderRadius: 2,
          }}
        />
        {ticks && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: ticks }).map((_, i) => {
              const tpct = (i / (ticks - 1)) * 100;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${tpct}%`,
                    top: 18,
                    width: 1,
                    height: 8,
                    background: tickColor,
                  }}
                />
              );
            })}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: `calc(${pct}% - 16px)`,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: thumbFill,
            border: `2px solid ${thumbBorder}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            transition: 'transform .12s',
          }}
        />
      </div>
    </div>
  );
}
