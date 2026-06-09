import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function useSearchableDropdown(options) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const debouncedQuery = useDebounce(query, 200);

  const suggestions = useMemo(() =>
    debouncedQuery.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(debouncedQuery.toLowerCase()))
      : options,
    [options, debouncedQuery]
  );

  const open  = useCallback(() => { setIsOpen(true); setActiveIndex(-1); }, []);
  const close = useCallback(() => { setIsOpen(false); setActiveIndex(-1); }, []);

  const select = useCallback((opt) => {
    setSelected(opt);
    setQuery(opt.label);
    close();
  }, [close]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) { if (e.key === 'ArrowDown' || e.key === 'Enter') open(); return; }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) select(suggestions[activeIndex]);
        break;
      case 'Escape':
        close();
        break;
      case 'Tab':
        close();
        break;
      default: break;
    }
  }, [isOpen, suggestions, activeIndex, select, open, close]);

  const handleQueryChange = useCallback((val) => {
    setQuery(val);
    setActiveIndex(-1);
    setIsOpen(true);
    if (!val) setSelected(null);
  }, []);

  return { query, setQuery: handleQueryChange, suggestions, activeIndex, isOpen, selected, open, close, select, handleKeyDown };
}
