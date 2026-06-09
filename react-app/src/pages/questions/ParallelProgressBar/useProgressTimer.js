import { useState, useRef, useCallback } from 'react';

export function useProgressTimer(durationMs = 4000) {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  const tick = useCallback((ts) => {
    if (!startTimeRef.current) startTimeRef.current = ts;
    const delta = ts - startTimeRef.current;
    const total = elapsedRef.current + delta;
    const pct = Math.min(100, (total / durationMs) * 100);
    setProgress(pct);
    if (pct < 100) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setIsRunning(false);
      elapsedRef.current = durationMs;
    }
  }, [durationMs]);

  const start = useCallback(() => {
    if (isRunning || progress >= 100) return;
    setIsRunning(true);
    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, progress, tick]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    cancelAnimationFrame(rafRef.current);
    elapsedRef.current += performance.now() - (startTimeRef.current ?? performance.now());
    startTimeRef.current = null;
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    elapsedRef.current = 0;
    startTimeRef.current = null;
    setProgress(0);
    setIsRunning(false);
  }, []);

  return { progress, isRunning, start, pause, reset };
}
