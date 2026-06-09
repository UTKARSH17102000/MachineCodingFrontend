import { useState, useRef, useCallback, useEffect } from 'react';

export function useCarousel(count, autoplayMs = 3500) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);

  const next = useCallback(() => setActiveIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + count) % count), [count]);
  const goTo = useCallback((i) => setActiveIndex(i), []);

  const pause  = useCallback(() => setIsPlaying(false), []);
  const resume = useCallback(() => setIsPlaying(true), []);

  useEffect(() => {
    if (!isPlaying) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(next, autoplayMs);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, next, autoplayMs]);

  return { activeIndex, isPlaying, next, prev, goTo, pause, resume };
}
