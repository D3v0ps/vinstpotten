interface Props {
  fill?: string;
  size?: number;
  print?: string;
  printColor?: string;
}

export function Tee({ fill = '#1a1612', size = 200, print, printColor = '#fff' }: Props) {
  return (
    <svg viewBox="0 0 220 240" width={size} height={size} style={{ display: 'block' }}>
      <path
        d="M70 20 L40 38 L18 70 L34 92 L60 80 L60 220 Q60 230 70 230 L150 230 Q160 230 160 220 L160 80 L186 92 L202 70 L180 38 L150 20 Q140 38 110 38 Q80 38 70 20 Z"
        fill={fill}
      />
      {print && (
        <text
          x="110"
          y="140"
          textAnchor="middle"
          fontFamily="Instrument Serif, serif"
          fontSize="22"
          fill={printColor}
          fontStyle="italic"
          letterSpacing="0.04em"
        >
          {print}
        </text>
      )}
    </svg>
  );
}
