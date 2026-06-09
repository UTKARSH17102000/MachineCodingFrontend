import { useEffect } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const el = containerRef.current;
    const focusable = [...el.querySelectorAll(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [containerRef, isActive]);
}
