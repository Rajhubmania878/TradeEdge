import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect live price / quote changes in table cells
 * and trigger a brief background flash animation ('tick-up' for green, 'tick-down' for red).
 */
export function usePriceFlash(value: number | null | undefined, durationMs = 800): string {
  const [flashClass, setFlashClass] = useState<string>('');
  const prevValRef = useRef<number | null | undefined>(value);

  useEffect(() => {
    const prev = prevValRef.current;
    if (prev !== undefined && prev !== null && value !== undefined && value !== null && prev !== value) {
      if (value > prev) {
        setFlashClass('tick-up');
      } else if (value < prev) {
        setFlashClass('tick-down');
      }

      const timer = setTimeout(() => {
        setFlashClass('');
      }, durationMs);

      prevValRef.current = value;
      return () => clearTimeout(timer);
    }
    prevValRef.current = value;
  }, [value, durationMs]);

  return flashClass;
}

export default usePriceFlash;
