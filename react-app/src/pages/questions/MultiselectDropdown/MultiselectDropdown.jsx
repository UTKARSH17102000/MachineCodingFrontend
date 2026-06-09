import { useRef, useCallback } from 'react';
import { useMultiselect } from './useMultiselect';
import { useClickOutside } from '@/hooks/useClickOutside';
import styles from './MultiselectDropdown.module.css';

const OPTIONS = [
  { id: 'react',      label: 'React' },
  { id: 'vue',        label: 'Vue' },
  { id: 'angular',    label: 'Angular' },
  { id: 'svelte',     label: 'Svelte' },
  { id: 'solid',      label: 'SolidJS' },
  { id: 'nextjs',     label: 'Next.js' },
  { id: 'nuxt',       label: 'Nuxt' },
  { id: 'remix',      label: 'Remix' },
  { id: 'astro',      label: 'Astro' },
  { id: 'qwik',       label: 'Qwik' },
];

export default function MultiselectDropdown() {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const state = useMultiselect(OPTIONS);

  const handleClose = useCallback(() => {
    state.close();
    triggerRef.current?.focus();
  }, [state]);

  useClickOutside(containerRef, handleClose);

  function handleOptionKeyDown(e, id, idx) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); state.toggle(id); }
    if (e.key === 'Escape') handleClose();
    if (e.key === 'ArrowDown') { e.preventDefault(); focusOption(idx + 1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusOption(idx - 1); }
  }

  function focusOption(idx) {
    const items = listRef.current?.querySelectorAll('[role="option"]');
    if (!items) return;
    const clamped = Math.min(Math.max(0, idx), items.length - 1);
    items[clamped]?.focus();
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Multiselect Dropdown</h1>
        <p className={styles.subheading}>
          ARIA listbox pattern — checkboxes, search, select-all, chips, keyboard navigation.
        </p>
      </header>

      <div className={styles.demo}>
        <div ref={containerRef} className={styles.container}>
          <button
            ref={triggerRef}
            id="ms-trigger"
            className={styles.trigger}
            aria-haspopup="listbox"
            aria-expanded={state.isOpen}
            aria-controls="ms-listbox"
            onClick={state.toggle_open}
          >
            {state.selected.size === 0
              ? 'Select frameworks…'
              : `${state.selected.size} selected`}
            <span className={`${styles.arrow} ${state.isOpen ? styles.arrowOpen : ''}`} aria-hidden="true">▾</span>
          </button>

          {state.isOpen && (
            <div className={styles.dropdown}>
              <div className={styles.searchRow}>
                <input
                  type="text"
                  className={styles.search}
                  placeholder="Search…"
                  aria-label="Search options"
                  value={state.search}
                  onChange={(e) => state.setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); focusOption(0); } if (e.key === 'Escape') handleClose(); }}
                  autoFocus
                />
              </div>

              {state.filtered.length > 0 && (
                <button
                  className={styles.selectAll}
                  onClick={state.toggleAll}
                  aria-checked={state.allFilteredSelected}
                >
                  <span className={styles.checkbox} data-checked={state.allFilteredSelected}>
                    {state.allFilteredSelected && '✓'}
                  </span>
                  {state.allFilteredSelected ? 'Deselect all' : 'Select all'}
                </button>
              )}

              <ul
                id="ms-listbox"
                ref={listRef}
                role="listbox"
                aria-multiselectable="true"
                aria-labelledby="ms-trigger"
                className={styles.listbox}
              >
                {state.filtered.length === 0 && (
                  <li className={styles.empty}>No results found</li>
                )}
                {state.filtered.map((opt, idx) => (
                  <li
                    key={opt.id}
                    id={`ms-opt-${opt.id}`}
                    role="option"
                    tabIndex={0}
                    aria-selected={state.selected.has(opt.id)}
                    className={`${styles.option} ${state.selected.has(opt.id) ? styles.optionSelected : ''}`}
                    onClick={() => state.toggle(opt.id)}
                    onKeyDown={(e) => handleOptionKeyDown(e, opt.id, idx)}
                  >
                    <span className={styles.checkbox} data-checked={state.selected.has(opt.id)} aria-hidden="true">
                      {state.selected.has(opt.id) && '✓'}
                    </span>
                    {opt.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {state.selectedItems.length > 0 && (
          <div className={styles.chips} role="list" aria-label="Selected frameworks">
            {state.selectedItems.map((item) => (
              <span key={item.id} role="listitem" className={styles.chip}>
                {item.label}
                <button
                  className={styles.chipRemove}
                  onClick={() => state.remove(item.id)}
                  aria-label={`Remove ${item.label}`}
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
