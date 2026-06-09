import { useState, useRef, useCallback } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import styles from './ComplexSidebar.module.css';

const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard', children: [] },
  { id: 'projects', icon: '📁', label: 'Projects', children: [
    { id: 'active',   icon: '▶', label: 'Active',   children: [] },
    { id: 'archived', icon: '⚑', label: 'Archived', children: [] },
    { id: 'shared',   icon: '↗', label: 'Shared',   children: [
      { id: 'team',  icon: '👥', label: 'Team',     children: [] },
      { id: 'org',   icon: '🏢', label: 'Org-wide', children: [] },
    ]},
  ]},
  { id: 'analytics', icon: '📊', label: 'Analytics', children: [
    { id: 'traffic',  icon: '〜', label: 'Traffic',   children: [] },
    { id: 'revenue',  icon: '＄', label: 'Revenue',   children: [] },
  ]},
  { id: 'settings', icon: '⚙', label: 'Settings', children: [] },
  { id: 'help',     icon: '?', label: 'Help',     children: [] },
];

function NavItem({ item, depth }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children?.length > 0;

  return (
    <li>
      <button
        className={`${styles.navItem} ${depth > 0 ? styles.navSub : ''}`}
        style={{ paddingLeft: `${1 + depth * 1}rem` }}
        aria-expanded={hasChildren ? open : undefined}
        onClick={() => hasChildren && setOpen((v) => !v)}
      >
        <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
        <span className={styles.navLabel}>{item.label}</span>
        {hasChildren && (
          <span className={`${styles.navChevron} ${open ? styles.navChevronOpen : ''}`} aria-hidden="true">›</span>
        )}
      </button>
      {hasChildren && open && (
        <ul className={styles.subList}>
          {item.children.map((child) => (
            <NavItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ComplexSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  useFocusTrap(sidebarRef, isOpen);

  const close = useCallback(() => setIsOpen(false), []);

  function handleKeyDown(e) {
    if (e.key === 'Escape') close();
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Complex Sidebar</h1>
        <p className={styles.subheading}>
          Multi-level collapsible nav — overlay + focus trap on mobile, persistent on desktop.
        </p>
      </header>

      <div className={styles.demo}>
        <button
          className={styles.toggleBtn}
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="sidebar"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? '✕ Close sidebar' : '☰ Open sidebar'}
        </button>

        <div className={styles.layout}>
          {isOpen && (
            <div
              className={styles.overlay}
              onClick={close}
              aria-hidden="true"
            />
          )}

          <aside
            id="sidebar"
            ref={sidebarRef}
            className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
            aria-label="Main navigation"
            aria-modal={isOpen}
            onKeyDown={handleKeyDown}
          >
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarBrand}>⬡ WorkSpace</span>
              <button className={styles.closeBtn} onClick={close} aria-label="Close sidebar">✕</button>
            </div>

            <nav>
              <ul className={styles.navList}>
                {NAV.map((item) => (
                  <NavItem key={item.id} item={item} depth={0} />
                ))}
              </ul>
            </nav>

            <div className={styles.sidebarFooter}>
              <span className={styles.userAvatar} aria-hidden="true">U</span>
              <div>
                <p className={styles.userName}>You</p>
                <p className={styles.userRole}>Frontend Engineer</p>
              </div>
            </div>
          </aside>

          <div className={styles.content}>
            <p className={styles.hint}>
              Sidebar demonstrates:<br />
              • Multi-level expand/collapse<br />
              • Overlay with click-outside close<br />
              • Focus trap (Tab cycles inside when open)<br />
              • Escape key to close
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
