import { memo } from 'react';
import { useFileExplorer } from './useFileExplorer';
import styles from './FileExplorer.module.css';

// ── Extension → icon color map ────────────────────────────────────────────────
// Defined at module scope: parsed once when the module loads.
// WHY: A constant lookup table that never changes. Placing it inside a component
// would recreate the object on every render with no benefit.
// WHAT IT IMPROVES: Zero allocation cost during renders — one Map in memory forever.
const EXT_COLORS = {
  // Documents
  pdf: '#ef4444',
  doc: '#3b82f6', docx: '#3b82f6',
  xls: '#22c55e', xlsx: '#22c55e',
  ppt: '#f97316', pptx: '#f97316',
  // Code
  js:  '#eab308', jsx: '#eab308',
  ts:  '#3b82f6', tsx: '#3b82f6',
  html: '#f97316',
  css:  '#38bdf8',
  json: '#fbbf24',
  md:   '#94a3b8',
  // Images
  png: '#a855f7', jpg: '#a855f7', jpeg: '#a855f7',
  gif: '#a855f7', svg: '#a855f7', webp: '#a855f7',
  // Audio
  mp3: '#ec4899', wav: '#ec4899', flac: '#ec4899', m3u: '#ec4899',
  // Video
  mp4: '#14b8a6', mov: '#14b8a6',
  // Archives
  zip: '#6b7280', rar: '#6b7280', gz: '#6b7280',
  // Text
  txt: '#94a3b8',
};
const DEFAULT_EXT_COLOR = '#8888aa';

// ── Icons ─────────────────────────────────────────────────────────────────────

function FolderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* back panel (tab) */}
      <path
        d="M2 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"
        fill="#f59e0b"
        opacity=".4"
      />
      {/* front panel */}
      <path
        d="M2 9a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z"
        fill="#f59e0b"
      />
    </svg>
  );
}

function FileIcon({ ext }) {
  const color = ext
    ? (EXT_COLORS[ext.toLowerCase()] ?? DEFAULT_EXT_COLOR)
    : DEFAULT_EXT_COLOR;
  const label = ext ? ext.toUpperCase().slice(0, 4) : '';

  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* document body */}
      <path
        d="M6 2h9l4 4v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
        fill={color}
        opacity=".18"
      />
      {/* folded corner */}
      <path d="M15 2l4 4h-4V2z" fill={color} opacity=".45" />
      {/* extension label rendered inside the SVG */}
      {label && (
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fill={color}
          fontSize="5"
          fontWeight="700"
          fontFamily="monospace"
          style={{ userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({ path, onNavigate }) {
  return (
    // <nav> gives role="navigation" to assistive tech
    <nav aria-label="Folder navigation" className={styles.breadcrumb}>
      {/* <ol> semantically conveys an ordered path (position matters) */}
      <ol className={styles.breadcrumbList}>
        {path.map((folder, index) => {
          const isLast = index === path.length - 1;
          return (
            <li key={folder.id} className={styles.breadcrumbItem}>
              {isLast ? (
                // Current location: non-interactive, aria-current="page"
                <span
                  className={styles.breadcrumbCurrent}
                  aria-current="page"
                >
                  {folder.name}
                </span>
              ) : (
                // Ancestor: interactive button
                <button
                  className={styles.breadcrumbBtn}
                  onClick={() => onNavigate(index)}
                >
                  {folder.name}
                </button>
              )}
              {/* Separator is decorative — hidden from screen readers */}
              {!isLast && (
                <span className={styles.breadcrumbSep} aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── ExplorerItem ──────────────────────────────────────────────────────────────

// React.memo wraps ExplorerItem.
// WHY: The parent re-renders whenever `path` changes (any navigation). Without memo,
// every item in the currently visible grid re-renders even if its data is unchanged.
// WHAT IT IMPROVES: Items skip re-renders when props are referentially equal.
// This is most effective for renders NOT caused by navigation — e.g., a theme
// context update bubbling down would trigger the parent, but memoized items skip it.
// The memo works because:
//   - `item` is the same object reference (from the frozen mock data)
//   - `onEnter` is stable via useCallback in the hook
const ExplorerItem = memo(function ExplorerItem({ item, onEnter }) {
  const isFolder = item.type === 'folder';
  // Derive extension from the explicit `ext` field, fall back to parsing the name.
  // Explicit field is preferred: avoids edge cases like dotfiles (.gitignore → ext = 'gitignore')
  const ext = item.ext ?? item.name.split('.').pop();
  const itemCount = isFolder ? (item.children?.length ?? 0) : null;

  function handleKeyDown(e) {
    if (isFolder && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onEnter(item);
    }
  }

  // Accessible label gives type + name + count/size to screen readers
  const ariaLabel = isFolder
    ? `${item.name}, folder, ${itemCount} item${itemCount !== 1 ? 's' : ''}`
    : `${item.name}, file${item.size ? `, ${item.size}` : ''}`;

  return (
    <li className={styles.itemWrapper}>
      <div
        // role="button" on folders: makes divs keyboard-focusable with Enter/Space semantics
        // role="presentation" on files: removes interactive semantics — display-only
        role={isFolder ? 'button' : 'presentation'}
        // tabIndex=-1 on files: removes them from Tab order — only folders are focusable
        tabIndex={isFolder ? 0 : -1}
        className={`${styles.item} ${isFolder ? styles.itemFolder : styles.itemFile}`}
        onClick={isFolder ? () => onEnter(item) : undefined}
        onKeyDown={isFolder ? handleKeyDown : undefined}
        aria-label={ariaLabel}
      >
        <div className={styles.itemIcon}>
          {isFolder ? <FolderIcon /> : <FileIcon ext={ext} />}
        </div>
        {/* title shows full name on hover — handles long truncated names */}
        <span className={styles.itemName} title={item.name}>
          {item.name}
        </span>
        <span className={styles.itemMeta}>
          {isFolder
            ? `${itemCount} item${itemCount !== 1 ? 's' : ''}`
            : (item.size ?? '')}
        </span>
      </div>
    </li>
  );
});

// ── Empty folder state ────────────────────────────────────────────────────────

function EmptyFolder() {
  return (
    <div className={styles.empty} role="status" aria-label="Empty folder">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"
          fill="currentColor"
          opacity=".15"
        />
        <path
          d="M2 9a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z"
          fill="currentColor"
          opacity=".25"
        />
      </svg>
      <p className={styles.emptyText}>This folder is empty</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FileExplorer() {
  const { path, sortedItems, navigateInto, navigateToBreadcrumb } =
    useFileExplorer();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>File Explorer</h1>
        <p className={styles.subheading}>
          Directory navigator — click a folder to enter it, use the breadcrumb
          to go back. Supports unlimited nesting depth.
        </p>
      </header>

      <div className={styles.explorerPane}>
        {/* Breadcrumb: scrolls horizontally for very deep paths */}
        <Breadcrumb path={path} onNavigate={navigateToBreadcrumb} />

        {/* Toolbar: item count badge */}
        <div className={styles.toolbar}>
          <span className={styles.itemCount}>
            {sortedItems.length}{' '}
            {sortedItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Grid or empty state */}
        {sortedItems.length === 0 ? (
          <EmptyFolder />
        ) : (
          // role="list" restores list semantics stripped by CSS (list-style: none
          // causes VoiceOver/Safari to stop announcing the list role).
          <ul
            className={styles.grid}
            role="list"
            aria-label="Folder contents"
          >
            {sortedItems.map((item) => (
              // key={item.id}: stable ID handles duplicate names (e.g. README.md
              // in two different folders) — name-based keys would cause wrong
              // element reuse when React reconciles between navigations.
              <ExplorerItem key={item.id} item={item} onEnter={navigateInto} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
