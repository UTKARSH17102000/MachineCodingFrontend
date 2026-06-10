# Tree Navigation + Checkbox — Interview Guide

> **Category:** Recursive UI · **Difficulty:** Hard

---

## What This Question Tests

Tree Checkbox is the hardest recursive UI question because it requires implementing tri-state logic — a node can be `checked`, `unchecked`, or `indeterminate` (some children checked, some not). The indeterminate state must be set as a DOM property (not an HTML attribute), parent selection cascades down to all descendants, and child selection propagates up to update ancestors. Getting the propagation direction right is the core challenge.

---

## Starting Point (First 2 Minutes)

1. **Tri-state logic:** "Three states: `checked` (all descendants checked), `unchecked` (none checked), `indeterminate` (some checked, some not). `indeterminate` is a DOM property — not an HTML attribute."
2. **Propagation direction:** "Checking a node checks ALL descendants (cascade down). Any change also updates ALL ancestors — each ancestor recomputes its state bottom-up."
3. **State model:** "I'll keep a flat `checkedIds: Set<string>` — the tri-state is computed, not stored."
4. **DOM `indeterminate` property:** "I'll use a `useRef` + `useEffect` to set `inputRef.current.indeterminate = true` — `indeterminate` can't be set as an HTML attribute in JSX."

---

## What the Interviewer is Looking For

- **Tri-state checkbox** — `checked`, `unchecked`, `indeterminate`.
- **`indeterminate` set as DOM property** via `useRef`, not as an attribute.
- **Cascade down** — checking a folder checks all its descendants.
- **Propagate up** — any change recomputes ancestor states bottom-up.
- Flat `checkedIds: Set` (not per-node state).
- Helper functions: `getAllDescendantIds(node)`, `getNodeState(node, checkedIds)`.

---

## Recommended Approach

### Step 1 — Flat `checkedIds` Set
```jsx
const [checkedIds, setCheckedIds] = useState(new Set());
```

### Step 2 — Get all descendant IDs (cascade helper)
```js
function getAllDescendantIds(node) {
  const ids = [];
  function walk(n) {
    if (!n.children) { ids.push(n.id); return; }
    n.children.forEach(walk);
  }
  walk(node);
  return ids;
}
```

### Step 3 — Compute node state (bottom-up)
```js
function getNodeState(node, checkedIds) {
  if (!node.children) return checkedIds.has(node.id) ? 'checked' : 'unchecked';
  const childStates = node.children.map((c) => getNodeState(c, checkedIds));
  if (childStates.every((s) => s === 'checked')) return 'checked';
  if (childStates.every((s) => s === 'unchecked')) return 'unchecked';
  return 'indeterminate';
}
```

### Step 4 — Handle check change (cascade down)
```js
function handleCheck(node, checked) {
  const leafIds = getAllDescendantIds(node); // includes node itself if leaf
  setCheckedIds((prev) => {
    const next = new Set(prev);
    leafIds.forEach((id) => checked ? next.add(id) : next.delete(id));
    return next;
  });
}
```

### Step 5 — Set DOM `indeterminate` property
```jsx
function CheckboxNode({ node, checkedIds, onCheck }) {
  const inputRef = useRef(null);
  const state = getNodeState(node, checkedIds);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = state === 'indeterminate';
    }
  }, [state]);

  return (
    <input
      type="checkbox"
      ref={inputRef}
      checked={state === 'checked'}
      onChange={(e) => onCheck(node, e.target.checked)}
    />
  );
}
```

---

## Optimizations Implemented

### Flat `checkedIds: Set` — node state is always derived
**What we did:** Only leaf-level ids are stored in `checkedIds`. Folder (branch) state is computed by `getNodeState(folder, checkedIds)` which recursively aggregates children.
**Why it matters:** Storing tri-state on every node requires updating ancestors on every change — O(depth) updates. Flat leaf storage means any number of nodes can change atomically in one `setCheckedIds` call, and the tree recomputes naturally.
**Interview signal:** Recognising that branch state is always derivable from leaf state — choosing the right state granularity.

### `indeterminate` DOM property via `useRef` + `useEffect`
**What we did:** `inputRef.current.indeterminate = state === 'indeterminate'` in a `useEffect`.
**Why it matters:** HTML has no `indeterminate` attribute — it's a DOM IDL property only. JSX `indeterminate={true}` silently does nothing. The `useEffect` + ref is the only way to set it.
**Interview signal:** This is the most common mistake in tree checkbox implementations — knowing the DOM property vs. HTML attribute distinction signals deep browser knowledge.

### `getAllDescendantIds` traversal — cascade down in one pass
**What we did:** Checking a folder collects all its leaf descendant IDs in one DFS pass, then adds/removes them from `checkedIds` in a single `setCheckedIds` call.
**Why it matters:** Iterative updates per-node (check child, re-render, check next child) would cause N renders for an N-node folder. Single batch update = one render.
**Interview signal:** Batch state updates for tree operations — avoiding N re-renders for N children.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Tri-state storage | `isChecked: boolean` per node | Flat `checkedIds: Set` + computed `getNodeState()` |
| Indeterminate | `indeterminate={true}` in JSX (does nothing) | `useRef` + `useEffect` to set DOM property |
| Cascade down | Click handler only updates clicked node | `getAllDescendantIds` + batch update |
| Propagate up | Manual parent update | Bottom-up computation via `getNodeState` on each render |
| Performance | N renders for checking N children | Single `setCheckedIds` for entire subtree |
| Select All | Not implemented | Trivially: check all leaf ids |

---

## Common Pitfalls to Avoid

- **`indeterminate={true}` in JSX:** Does nothing — there is no `indeterminate` HTML attribute. Use a ref + `useEffect`.
- **Storing tri-state on each node:** This requires manual ancestor propagation after every change — complex and error-prone.
- **Updating children one at a time:** Each update triggers a re-render. Collect all descendant IDs first, then do a single `setCheckedIds` update.
- **Forgetting to handle the "check parent = uncheck if all were checked" case:** Clicking an indeterminate parent should check all children (not toggle off).

---

## Key Takeaways

- Flat `checkedIds: Set` stores only leaf ids — folder state is always derived from children.
- `indeterminate` is a DOM property, not an HTML attribute — `useRef.current.indeterminate = true` is the only way.
- Cascade down: `getAllDescendantIds(node)` in one traversal, batch update in one `setCheckedIds`.
- Propagate up: automatically happens via `getNodeState` recomputing on each render — no explicit upward walk needed.
- This question has three difficulty ramps: get tri-state working → cascade down → set DOM property correctly. Address them in order.
