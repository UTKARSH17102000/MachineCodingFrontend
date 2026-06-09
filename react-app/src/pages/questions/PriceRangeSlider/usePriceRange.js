import { useState, useCallback } from 'react';

export function usePriceRange({ min: absMin = 0, max: absMax = 1000, initial = [100, 700] } = {}) {
  const [range, setRange] = useState(initial);

  const setMin = useCallback((val) => {
    setRange(([, prevMax]) => [Math.min(Number(val), prevMax - 1), prevMax]);
  }, []);

  const setMax = useCallback((val) => {
    setRange(([prevMin]) => [prevMin, Math.max(Number(val), prevMin + 1)]);
  }, []);

  const pctMin = ((range[0] - absMin) / (absMax - absMin)) * 100;
  const pctMax = ((range[1] - absMin) / (absMax - absMin)) * 100;

  return { min: range[0], max: range[1], absMin, absMax, pctMin, pctMax, setMin, setMax };
}
