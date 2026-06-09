import { useRef, useEffect } from 'react';
import { useAccordion } from './useAccordion';
import styles from './Accordion.module.css';

const SINGLE_ITEMS = [
  { id: 'q1', title: 'What is the virtual DOM?', body: 'The virtual DOM is an in-memory representation of the real DOM. React diffs the virtual DOM tree to compute the minimal set of real DOM updates, making UI updates more efficient.' },
  { id: 'q2', title: 'What is a closure in JavaScript?', body: 'A closure is a function that retains access to its outer lexical scope even after the outer function has returned. This enables patterns like data encapsulation and factory functions.' },
  { id: 'q3', title: 'Explain the event loop.', body: 'The JavaScript event loop continuously checks the call stack and the task queue. When the call stack is empty, it picks the next task from the queue, enabling non-blocking async I/O in a single-threaded runtime.' },
  { id: 'q4', title: 'What is CSS specificity?', body: 'Specificity is the algorithm browsers use to decide which CSS rule applies when multiple rules target the same element. It is calculated as a tuple of (inline, id, class/attr/pseudo-class, element) weights.' },
];

const MULTI_ITEMS = [
  { id: 'm1', title: 'Feature A', body: 'Multi-open mode lets any number of panels be open simultaneously. This is useful for settings panels, filter facets, and comparison views.' },
  { id: 'm2', title: 'Feature B', body: 'Each panel animates height independently. The animation uses max-height transition with the actual content height measured via useRef to avoid the max-height: 9999px hack.' },
  { id: 'm3', title: 'Feature C', body: 'Keyboard navigation follows the ARIA Accordion pattern: Enter/Space toggles, ArrowDown/Up move focus between headers.' },
];

function AccordionItem({ id, title, body, isOpen, onToggle }) {
  const panelRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!panelRef.current || !contentRef.current) return;
    panelRef.current.style.maxHeight = isOpen ? `${contentRef.current.scrollHeight}px` : '0px';
  }, [isOpen]);

  return (
    <div className={styles.item}>
      <h3 className={styles.headerWrap}>
        <button
          id={`header-${id}`}
          className={styles.header}
          aria-expanded={isOpen}
          aria-controls={`panel-${id}`}
          onClick={() => onToggle(id)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); focusNeighbour(e.currentTarget, 1); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); focusNeighbour(e.currentTarget, -1); }
          }}
        >
          <span>{title}</span>
          <span className={`${styles.chevron} ${isOpen ? styles.open : ''}`} aria-hidden="true">▾</span>
        </button>
      </h3>
      <div
        ref={panelRef}
        id={`panel-${id}`}
        role="region"
        aria-labelledby={`header-${id}`}
        className={styles.panel}
      >
        <div ref={contentRef} className={styles.panelContent}>
          <p>{body}</p>
        </div>
      </div>
    </div>
  );
}

function focusNeighbour(btn, dir) {
  const headers = [...btn.closest('[data-accordion]').querySelectorAll('[data-accordion-header]')];
  const idx = headers.indexOf(btn);
  const next = headers[(idx + dir + headers.length) % headers.length];
  next?.focus();
}

function AccordionGroup({ items, mode, label }) {
  const { toggle, isOpen } = useAccordion({ mode });
  return (
    <div className={styles.group}>
      <h2 className={styles.groupTitle}>{label}</h2>
      <div className={styles.accordion} data-accordion>
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            {...item}
            isOpen={isOpen(item.id)}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  );
}

export default function Accordion() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Accordion</h1>
        <p className={styles.subheading}>Single-open (exclusive) and multi-open modes. Keyboard navigable.</p>
      </header>
      <AccordionGroup items={SINGLE_ITEMS} mode="single" label="Single-open mode (FAQ)" />
      <AccordionGroup items={MULTI_ITEMS} mode="multiple" label="Multi-open mode" />
    </section>
  );
}
