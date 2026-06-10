# File Explorer — Interview Guide

> **Category:** Navigation · **Difficulty:** Medium

---

## What This Question Tests

File Explorer (directory navigator) tests whether you think in terms of data structures before rendering. The key insight is representing the current path as an array of **actual node references** — not ids, not names — so that navigation (entering a folder, going back) is O(1). Pair this with a `nodeMap` (id → node) for O(1) click resolution, and you have an efficient, unbounded-depth navigator.

---

## Starting Point (First 2 Minutes)

1. **Path-as-object-references:** "I'll store the current path as an array of node objects from the tree — `[root, folder, subfolder]`. The current directory is always `path[path.length - 1]`. The breadcrumb is `path.map(n => n.name)`."
2. **`nodeMap` for click handling:** "I'll pre-build a `Map<id, node>` so any folder click resolves the node in O(1) without searching the tree."
3. **No recursion in the UI:** "The grid renders `currentFolder.children` — a flat list. No recursive rendering needed for the grid view."
4. **File type colours/icons:** "I'll use a file extension → colour/icon map — not hardcoded per extension."

---

## What the Interviewer is Looking For

- `path: TreeNode[]` — array of object references, not ids.
- `nodeMap: Map<id, node>` — built once, O(1) resolution.
- Breadcrumb from `path.map(n => n.name)` — clicking any crumb slices `path` to that index.
- Grid renders `path[path.length - 1].children` — always flat, never recursive.
- File extensions mapped to colours/icons.
- Keyboard support: arrow keys to navigate grid, Enter to enter a folder.
- Empty folder state.

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
  walk(FILE_SYSTEM);
  return map;
}, []);
```

### Step 2 — Path state
```jsx
const [path, setPath] = useState([FILE_SYSTEM]); // starts at root
const currentFolder   = path[path.length - 1];
```

### Step 3 — Navigation
```jsx
function navigateInto(folder) {
  setPath((prev) => [...prev, folder]); // O(1) — push reference
}
function navigateToBreadcrumb(index) {
  setPath((prev) => prev.slice(0, index + 1)); // O(1) — slice
}
```

### Step 4 — Breadcrumb from path
```jsx
{path.map((node, index) => (
  <button key={node.id} onClick={() => navigateToBreadcrumb(index)}>
    {node.name}
    {index < path.length - 1 && <span aria-hidden> / </span>}
  </button>
))}
```

### Step 5 — Grid (flat render)
```jsx
{currentFolder.children?.map((node) => (
  <div
    key={node.id}
    role={node.children ? 'button' : 'img'}
    tabIndex={0}
    onClick={() => node.children && navigateInto(node)}
    onKeyDown={(e) => e.key === 'Enter' && node.children && navigateInto(node)}
  >
    <FileIcon node={node} />
    <span>{node.name}</span>
  </div>
))}
```

---

## Optimizations Implemented

### Path-as-object-references — O(1) navigation
**What we did:** `path` is `TreeNode[]` — an array of actual node objects from the tree. `path[path.length - 1]` is the current folder, accessible in O(1). `path.map(n => n.name)` generates the breadcrumb in O(depth).
**Why it matters:** An alternative is to store `path` as an array of ids and look up `nodeMap.get(id)` for the current folder. That's also O(1), but path-as-references is even simpler — `path.last` IS the current folder.
**Interview signal:** Choosing the right type of reference to store in state based on access patterns.

### `nodeMap` for O(1) click resolution
**What we did:** A flat `Map<id, node>` is built once via DFS traversal. Folder clicks receive the node id (from `data-folder-id`) and resolve with `nodeMap.get(id)`.
**Why it matters:** Without the map, clicking a folder requires searching the tree from the root — O(n). With a map, it's O(1) regardless of depth.
**Interview signal:** Pre-processing tree data for O(1) access is a data structure interview fundamental.

### Flat grid rendering — no recursion in the UI
**What we did:** The grid always renders `currentFolder.children` — a flat array. No recursive `<GridItem>` components, no depth tracking in JSX.
**Why it matters:** Recursive rendering for a file explorer would be complex and unnecessary. The "current directory" abstraction means you always render a flat list of the current level's contents.
**Interview signal:** Recognising that not all tree-based UIs need recursive rendering — the navigator pattern is flat by design.

### File extension → colour map
**What we did:** `EXT_COLORS = { js: '#f0db4f', ts: '#3178c6', css: '#264de4', ... }` — extension-based colouring.
**Why it matters:** Hardcoding a `switch` statement per extension is unmaintainable. A map is O(1) lookup and trivially extensible.
**Interview signal:** Data-driven rendering — drive UI variants from a lookup table, not switch statements.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Current path | Array of ids + separate nodeMap lookup | Array of object references — `path.last` is current folder |
| Navigation | Traverse tree to find target | `navigateInto(node)` — push reference, O(1) |
| Breadcrumb | Separate breadcrumb state | Derived from `path.map(n => n.name)` |
| Grid | Recursive component | Flat render of `currentFolder.children` |
| File icons | Hardcoded switch per extension | Extension → colour/icon map |
| Back navigation | Only handles one level back | Breadcrumb slicing to any depth |

---

## Common Pitfalls to Avoid

- **Storing the path as node ids:** Requires a separate map lookup to get the actual node — one more indirection than necessary.
- **Recursive grid rendering:** The whole point of the "current folder" abstraction is that you always render a flat list. Recursion adds complexity with no benefit.
- **Hardcoded extension handling:** `switch (ext) { case 'js': return '#f0db4f'; ... }` — unmaintainable for many file types. Use a lookup object.
- **Not handling empty folders:** `currentFolder.children?.length === 0` should show an "empty folder" state.

---

## Key Takeaways

- `path: TreeNode[]` — array of object references. Current folder = `path[path.length - 1]`. O(1) access.
- `nodeMap: Map<id, node>` — built once at init. O(1) click resolution for any depth.
- Breadcrumb is derived from `path.map(n => n.name)` — click to slice `path` back to any depth.
- Grid rendering is always flat — the navigator pattern is NOT recursive.
- Extension → icon/colour map is the clean data-driven approach — not a switch statement.
