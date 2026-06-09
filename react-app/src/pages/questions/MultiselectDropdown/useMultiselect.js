import { useState, useCallback, useMemo } from 'react';

export function useMultiselect(options) {
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() =>
    options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((o) => o.id))
    );
  }, [filtered]);

  const remove = useCallback((id) => {
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => { setIsOpen(false); setSearch(''); }, []);
  const toggle_open = useCallback(() => setIsOpen((v) => !v), []);

  const selectedItems = useMemo(() => options.filter((o) => selected.has(o.id)), [options, selected]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));

  return { selected, search, setSearch, isOpen, filtered, selectedItems, allFilteredSelected, toggle, toggleAll, remove, open, close, toggle_open };
}
