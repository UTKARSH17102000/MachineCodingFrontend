# Nested File System — Interview Guide

> **Category:** Recursive UI · **Difficulty:** Hard

---

## What This Question Tests

Nested File System tests recursive component rendering, tree data structure navigation, and the ARIA tree pattern (`role="tree"` / `role="treeitem"`). The key lead signals are: a `nodeMap` (id → node) for O(1) click handling instead of O(n) tree traversal, a `Set` for expand/collapse state (not a recursive `isOpen` property on data), and correct keyboard tree navigation (arrow keys per ARIA spec).

---

## Starting Point (First 2 Minutes)

1. **Recursive component:** "I'll write a single `<TreeNode>` component that renders itself recursively for children — the tree depth is arbitrary."
2. **State architecture:** "I'll keep `expandedIds: Set<string>` as a flat set at the root. The tree data itself stays pure and immutable."
3. **O(1) click handling:** "I'll pre-build a `nodeMap` (`id → node`) from the tree so any click resolves the node in O(1) without searching the tree."
4. **ARIA tree pattern:** "`role='tree'` on the root `<ul>`, `role='treeitem'` on each `<li>`, `aria-expanded` on folders, `aria-selected` on the selected node."

---

## What the Interviewer is Looking For

- Recursive `<TreeNode>` component.
- `expandedIds: Set<string>` (not `node.isOpen` mutation).
- **O(1) `nodeMap`** for click handling.
- `role="tree"`, `role="treeitem"`, `aria-expanded`, `aria-selected`.
- Keyboard navigation: ArrowRight (expand/enter), ArrowLeft (collapse/parent), ArrowDown/Up (next/prev visible), Enter/Space (select).
- File type icons based on extension.
- **Never mutate the tree data** — all state is lifted to the root component.

---

## Recommended Approach

### Step 1 — Build `nodeMap` at init
```js
const nodeMap = useMemo(() => {
  const map = new Map();
  function walk(node) {
    map.set(node.id, node);
    node.children?.forEach(walk);
  }
  walk(ROOT);
  return map;
}, []);
```

### Step 2 — Expand state
```jsx
const [expandedIds, setExpandedIds] = useState(new Set());
function toggle(id) {
  setExpandedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
}
```

### Step 3 — Recursive TreeNode
```jsx
function TreeNode({ node, level, expandedIds, selectedId, onToggle, onSelect }) {
  const isExpanded = expandedIds.has(node.id);
  const isFolder = !!node.children;
  return (
    <li
      role="treeitem"
      aria-expanded={isFolder ? isExpanded : undefined}
      aria-selected={selectedId === node.id}
      aria-level={level}
    >
      <div className={styles.row} onClick={() => isFolder ? onToggle(node.id) : onSelect(node.id)}>
        {isFolder && <span className={styles.chevron}>{isExpanded ? '▼' : '▶'}</span>}
        <span>{node.name}</span>
      </div>
      {isFolder && isExpanded && (
        <ul role="group">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} {...rest} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

---

## Optimizations Implemented

### `nodeMap` — O(1) click resolution
**What we did:** A `Map<id, node>` is built once via `useMemo` (or an IIFE outside the component). Every click handler receives the `id` and resolves it with `nodeMap.get(id)` in O(1).
**Why it matters:** Without a map, finding a node by id requires traversing the tree — O(n) where n is the total node count. For large file systems (thousands of nodes), this is significant.
**Interview signal:** Pre-processing the tree for O(1) access is a data structure literacy signal.

### `expandedIds: Set` at root — tree data stays pure
**What we did:** `expandedIds` is a `Set<string>` in the root component. Tree node data never gets a mutable `isOpen` property.
**Why it matters:** If expand state lives in the tree data, you'd mutate the data on every toggle — breaking immutability and making state snapshots (e.g., for undo) impossible.
**Interview signal:** Separating "domain data" (the file tree) from "UI state" (which nodes are expanded) is a critical architectural principle.

### Keyboard tree navigation per ARIA spec
**What we did:** ArrowRight expands a closed folder (or moves to first child if open). ArrowLeft collapses an open folder (or moves to parent). ArrowDown/Up move to the next/previous visible node in the flattened visible order.
**Why it matters:** The ARIA tree keyboard pattern is specified — implementing it correctly makes the tree usable for keyboard and AT users.
**Interview signal:** Reading the ARIA spec for non-trivial patterns.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Node lookup | Traverse tree on every click — O(n) | `nodeMap` — O(1) |
| Expand state | `isOpen` property on tree data (mutation) | `expandedIds: Set` at root — data stays pure |
| Component | Separate component per depth or hardcoded | Single `<TreeNode>` recursing infinitely |
| ARIA | No roles or basic `aria-expanded` | Full `role="tree/treeitem/group"`, `aria-level`, keyboard nav |
| File icons | Same icon for all | Extension-based colour/icon map |
| Large trees | Renders entire tree | Mentions virtualisation for 10,000+ nodes |

---

## Common Pitfalls to Avoid

- **Mutating tree data for expand state:** `node.isOpen = !node.isOpen` causes React to miss the state change (same reference) or makes the data impure (can't serialize/restore).
- **O(n) search on every click:** Passing the click target's `id` to a recursive `findNode` function traverses the whole tree — use a flat map.
- **Rendering all nodes regardless of expansion:** A collapsed folder should render no children — the recursive call only runs if `isExpanded` is true.
- **Using array index as key:** If nodes are added/removed, indices shift — use stable `node.id` as key.

---

## Key Takeaways

- `nodeMap = Map<id, node>` built once — O(1) resolution for all user interactions.
- `expandedIds: Set<string>` at root — tree data is pure domain data, never mutated for UI state.
- Single recursive `<TreeNode>` component handles arbitrary depth.
- `aria-level` attribute communicates nesting depth to screen readers.
- For large trees (1000+ nodes): mention row virtualisation (`react-window`) — you won't implement it in 45 minutes but naming it shows production awareness.
