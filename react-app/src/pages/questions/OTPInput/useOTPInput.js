import { useState, useRef, useCallback } from 'react';

export function useOTPInput(length = 6) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);

  const focusAt = useCallback((idx) => {
    const clamped = Math.min(Math.max(0, idx), length - 1);
    refs.current[clamped]?.focus();
  }, [length]);

  const handleChange = useCallback((idx, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setValues((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit) focusAt(idx + 1);
  }, [focusAt]);

  const handleKeyDown = useCallback((idx, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setValues((prev) => {
        const next = [...prev];
        if (next[idx]) {
          next[idx] = '';
        } else {
          next[Math.max(0, idx - 1)] = '';
          focusAt(idx - 1);
        }
        return next;
      });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault(); focusAt(idx - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault(); focusAt(idx + 1);
    }
  }, [focusAt]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = Array(length).fill('');
    [...text].forEach((ch, i) => { next[i] = ch; });
    setValues(next);
    focusAt(Math.min(text.length, length - 1));
  }, [length, focusAt]);

  const reset = useCallback(() => {
    setValues(Array(length).fill(''));
    focusAt(0);
  }, [length, focusAt]);

  return { values, refs, handleChange, handleKeyDown, handlePaste, reset };
}
