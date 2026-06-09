import { useFileTree } from './useFileTree';
import { FILE_TREE } from './mockData';
import styles from './FileTree.module.css';

const FILE_ICONS = { folder: '📁', folderOpen: '📂', file: '📄', js: '⚛', jsx: '⚛', ts: '🔷', tsx: '🔷', json: '📋', md: '📝', html: '🌐', css: '🎨', ico: '🖼', gitignore: '🚫' };

function getIcon(node, isExpanded) {
  if (node.type === 'folder') return isExpanded ? FILE_ICONS.folderOpen : FILE_ICONS.folder;
  const ext = node.name.split('.').pop();
  return FILE_ICONS[ext] ?? FILE_ICONS.file;
}

function TreeNode({ node, depth, ctx }) {
  const isFolder = node.type === 'folder';
  const expanded = isFolder && ctx.isExpanded(node.id);
  const selected = ctx.isSelected(node.id);

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isFolder) ctx.toggle(node.id);
      ctx.select(node.id);
    }
    if (e.key === 'ArrowRight' && isFolder && !expanded) { e.preventDefault(); ctx.toggle(node.id); }
    if (e.key === 'ArrowLeft'  && isFolder && expanded)  { e.preventDefault(); ctx.toggle(node.id); }
  }

  return (
    <li
      role="treeitem"
      aria-expanded={isFolder ? expanded : undefined}
      aria-selected={selected}
      aria-level={depth}
      tabIndex={0}
      className={`${styles.node} ${selected ? styles.selected : ''}`}
      style={{ paddingLeft: `${depth * 1.25}rem` }}
      onClick={() => { if (isFolder) ctx.toggle(node.id); ctx.select(node.id); }}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.nodeInner}>
        <span className={styles.icon} aria-hidden="true">{getIcon(node, expanded)}</span>
        <span className={styles.name}>{node.name}</span>
      </span>

      {isFolder && expanded && node.children?.length > 0 && (
        <ul role="group" className={styles.children}>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} ctx={ctx} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function FileTree() {
  const ctx = useFileTree();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Nested File System</h1>
        <p className={styles.subheading}>
          ARIA tree widget — click or Enter/Space to expand folders. Arrow keys navigate.
        </p>
      </header>

      <div className={styles.explorer}>
        <div className={styles.sidebar}>
          <p className={styles.sidebarTitle}>EXPLORER</p>
          <ul role="tree" aria-label="File explorer" className={styles.tree}>
            {FILE_TREE.children?.map((node) => (
              <TreeNode key={node.id} node={node} depth={1} ctx={ctx} />
            ))}
          </ul>
        </div>
        <div className={styles.main}>
          <p className={styles.placeholder}>Select a file to view its contents</p>
        </div>
      </div>
    </section>
  );
}
