import { useRef } from 'react';
import { useTabs } from './useTabs';
import styles from './Tabs.module.css';

const TAB_SETS = [
  {
    id: 'basic',
    label: 'Basic tabs',
    tabs: [
      { id: 'overview',  label: 'Overview',  content: 'Overview content: This tab demonstrates the standard ARIA tablist pattern with roving tabindex. Arrow keys move focus between tabs, Enter/Space selects.' },
      { id: 'features',  label: 'Features',  content: 'Features content: Keyboard navigation, ARIA roles, controlled and uncontrolled modes, smooth focus ring transitions.' },
      { id: 'api',       label: 'API',        content: 'API content: useTabs(initialTab) returns { activeTab, select }. The Tab component handles all keyboard and ARIA wiring.' },
      { id: 'examples',  label: 'Examples',   content: 'Examples content: Use tabs for navigation between related content sections where all content is available without a network request.' },
    ],
  },
];

function TabStrip({ tabs, activeTab, onSelect }) {
  const refs = useRef({});

  function handleKeyDown(e, idx) {
    const count = tabs.length;
    let nextIdx = null;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % count;
    if (e.key === 'ArrowLeft')  nextIdx = (idx - 1 + count) % count;
    if (e.key === 'Home')       nextIdx = 0;
    if (e.key === 'End')        nextIdx = count - 1;
    if (nextIdx !== null) {
      e.preventDefault();
      const nextId = tabs[nextIdx].id;
      onSelect(nextId);
      refs.current[nextId]?.focus();
    }
  }

  return (
    <div role="tablist" aria-label="Content tabs" className={styles.tabList}>
      {tabs.map((tab, idx) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          ref={(el) => { refs.current[tab.id] = el; }}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onSelect(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function TabPanels({ tabs, activeTab }) {
  return (
    <div className={styles.panels}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          tabIndex={0}
          hidden={activeTab !== tab.id}
          className={styles.panel}
        >
          <p>{tab.content}</p>
        </div>
      ))}
    </div>
  );
}

export default function Tabs() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Tabs Component</h1>
        <p className={styles.subheading}>
          ARIA tablist pattern — roving tabindex, ArrowLeft/Right navigation, Home/End.
        </p>
      </header>

      {TAB_SETS.map(({ id, label, tabs }) => {
        const { activeTab, select } = useTabs(tabs[0].id);
        return (
          <div key={id} className={styles.tabSet}>
            <p className={styles.setLabel}>{label}</p>
            <div className={styles.widget}>
              <TabStrip tabs={tabs} activeTab={activeTab} onSelect={select} />
              <TabPanels tabs={tabs} activeTab={activeTab} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
