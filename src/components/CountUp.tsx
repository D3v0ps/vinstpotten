import { useEffect, useRef, useState } from 'react';
import { formatSEK } from '@/lib/calculator';

interface Props {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}

export function CountUp({ value, duration = 400, format = formatSEK }: Props) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = shown;
    fromRef.current = from;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(from + (value - from) * eased);
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <>{format(shown)}</>;
}
