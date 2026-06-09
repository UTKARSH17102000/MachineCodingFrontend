import { useRef, useEffect } from 'react';
import { useTreeCheckbox } from './useTreeCheckbox';
import { TREE_DATA } from './mockTree';
import styles from './TreeCheckbox.module.css';

function CheckboxNode({ node, depth, getState, toggle }) {
  const state = getState(node);
  const checkboxRef = useRef(null);

  useEffect(() => {
    if (!checkboxRef.current) return;
    checkboxRef.current.indeterminate = state === 'indeterminate';
    checkboxRef.current.checked = state === 'checked';
  }, [state]);

  return (
    <li
      role="treeitem"
      aria-expanded={node.children?.length ? state !== 'unchecked' : undefined}
      aria-checked={state === 'indeterminate' ? 'mixed' : state === 'checked'}
      aria-level={depth}
      className={styles.node}
      style={{ paddingLeft: `${(depth - 1) * 1.5}rem` }}
    >
      <label className={styles.label}>
        <input
          ref={checkboxRef}
          type="checkbox"
          className={styles.checkbox}
          onChange={() => toggle(node)}
          aria-label={node.label}
        />
        <span className={styles.labelText}>{node.label}</span>
        {node.children?.length > 0 && (
          <span className={styles.childCount}>{node.children.length}</span>
        )}
      </label>

      {node.children?.length > 0 && (
        <ul role="group" className={styles.children}>
          {node.children.map((child) => (
            <CheckboxNode key={child.id} node={child} depth={depth + 1} getState={getState} toggle={toggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeCheckbox() {
  const { getState, toggle, selectedCount } = useTreeCheckbox();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Tree Navigation + Checkbox</h1>
        <p className={styles.subheading}>
          Tri-state checkboxes — checking a parent checks all children; partial selection shows indeterminate.
        </p>
      </header>

      <div className={styles.demo}>
        <p className={styles.selectionInfo} role="status" aria-live="polite">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </p>
        <ul role="tree" aria-label="Topic selection" className={styles.tree}>
          {TREE_DATA.map((node) => (
            <CheckboxNode key={node.id} node={node} depth={1} getState={getState} toggle={toggle} />
          ))}
        </ul>
      </div>
    </section>
  );
}
