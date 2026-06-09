import { useState, useCallback } from 'react';

export function useAccordion({ mode = 'single' } = {}) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggle = useCallback((id) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (mode === 'single') next.clear();
        next.add(id);
      }
      return next;
    });
  }, [mode]);

  const isOpen = (id) => openItems.has(id);

  return { toggle, isOpen };
}
