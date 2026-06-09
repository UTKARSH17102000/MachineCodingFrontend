import { useState, useCallback } from 'react';

export function useFileTree() {
  const [expanded, setExpanded] = useState(new Set(['root', 'src']));
  const [selected, setSelected] = useState(null);

  const toggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const select = useCallback((id) => setSelected(id), []);

  return {
    isExpanded: (id) => expanded.has(id),
    isSelected: (id) => selected === id,
    toggle,
    select,
  };
}
