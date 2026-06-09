import { useRef, useCallback } from 'react';
import { useSearchableDropdown } from './useSearchableDropdown';
import { useClickOutside } from '@/hooks/useClickOutside';
import styles from './SearchableDropdown.module.css';

const OPTIONS = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh',
  'Belgium','Brazil','Canada','Chile','China','Colombia','Denmark','Egypt',
  'Ethiopia','Finland','France','Germany','Ghana','Greece','India','Indonesia',
  'Iran','Iraq','Ireland','Israel','Italy','Japan','Kenya','Mexico','Netherlands',
  'New Zealand','Nigeria','Norway','Pakistan','Peru','Philippines','Poland',
  'Portugal','Romania','Russia','Saudi Arabia','South Africa','Spain','Sweden',
  'Switzerland','Thailand','Turkey','United Kingdom','United States','Vietnam',
].map((l) => ({ id: l.toLowerCase().replace(/\s/g, '-'), label: l }));

function highlight(text, query) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchableDropdown() {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const state = useSearchableDropdown(OPTIONS);

  const handleClose = useCallback(() => {
    state.close();
  }, [state]);

  useClickOutside(containerRef, handleClose);

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Searchable Dropdown</h1>
        <p className={styles.subheading}>
          ARIA combobox — type to filter, ArrowUp/Down to navigate, Enter to select, Escape to close.
        </p>
      </header>

      <div className={styles.demo}>
        <div ref={containerRef} className={styles.container}>
          <input
            ref={inputRef}
            id="sd-input"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={state.isOpen}
            aria-controls="sd-listbox"
            aria-activedescendant={state.activeIndex >= 0 ? `sd-opt-${state.activeIndex}` : undefined}
            className={styles.input}
            placeholder="Search countries…"
            value={state.query}
            onChange={(e) => state.setQuery(e.target.value)}
            onFocus={state.open}
            onKeyDown={state.handleKeyDown}
            autoComplete="off"
          />

          {state.isOpen && (
            <ul
              id="sd-listbox"
              ref={listRef}
              role="listbox"
              aria-label="Countries"
              className={styles.listbox}
            >
              {state.suggestions.length === 0 && (
                <li className={styles.empty}>No results for "{state.query}"</li>
              )}
              {state.suggestions.map((opt, idx) => (
                <li
                  key={opt.id}
                  id={`sd-opt-${idx}`}
                  role="option"
                  aria-selected={state.selected?.id === opt.id}
                  className={`${styles.option} ${idx === state.activeIndex ? styles.active : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); state.select(opt); }}
                >
                  {highlight(opt.label, state.query)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {state.selected && (
          <p className={styles.result} role="status" aria-live="polite">
            Selected: <strong>{state.selected.label}</strong>
          </p>
        )}
      </div>
    </section>
  );
}
