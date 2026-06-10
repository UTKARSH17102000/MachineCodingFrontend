# Jira Board (Drag & Drop) — Interview Guide

> **Category:** Interaction · **Difficulty:** Hard

---

## What This Question Tests

Jira Board tests your ability to implement drag-and-drop using the HTML5 native DnD API — specifically `draggable`, `onDragStart`, `onDragOver`, `onDrop`. The interviewer wants to see that you track drag source and target **in refs** (not state), understand that `dragover` must call `e.preventDefault()` to allow drops, and that you implement a keyboard fallback (arrow keys to move cards) for accessibility. The column state management (which cards belong to which column) is also evaluated.

---

## Starting Point (First 2 Minutes)

1. **Native DnD vs. library:** "I'll use the HTML5 native DnD API — it works on desktop and has basic mobile support. For a production app I'd use `react-dnd` or `dnd-kit`, but native is appropriate for an interview."
2. **State model:** "Columns is an object: `{ todo: Card[], inProgress: Card[], done: Card[] }`. Moving a card removes it from the source column and inserts it at the target position."
3. **Ref-based drag tracking:** "I'll track the dragged card and source column in `useRef` — not `useState` — to avoid re-renders during drag."
4. **`dragover` preventDefault:** "You MUST call `e.preventDefault()` in `onDragOver` to signal the browser that a drop is allowed. Without it, the `drop` event never fires."

---

## What the Interviewer is Looking For

- `draggable="true"` on each card.
- `onDragStart` — store card id and source column in refs.
- `onDragOver` — call `e.preventDefault()` on the column container.
- `onDrop` — move card from source column to target column.
- **Visual feedback** — `dragover` class on the target column.
- **Keyboard fallback** — buttons or keys to move a card left/right.
- Column headers with card counts.
- `aria-grabbed` (or `aria-pressed`) on dragged cards for AT.

---

## Recommended Approach

### Step 1 — State
```jsx
const [columns, setColumns] = useState({
  todo: initialCards,
  inProgress: [],
  done: [],
});
const dragCard   = useRef(null); // { id, colKey }
const dragOver   = useRef(null); // column key being hovered
```

### Step 2 — Drag handlers
```jsx
function handleDragStart(cardId, colKey) {
  dragCard.current = { id: cardId, colKey };
}
function handleDragOver(e, colKey) {
  e.preventDefault(); // required to allow drop
  dragOver.current = colKey;
  // add visual class to column
}
function handleDrop(e, targetColKey) {
  e.preventDefault();
  const { id, colKey: sourceColKey } = dragCard.current;
  if (sourceColKey === targetColKey) return;

  setColumns((prev) => {
    const card = prev[sourceColKey].find((c) => c.id === id);
    return {
      ...prev,
      [sourceColKey]: prev[sourceColKey].filter((c) => c.id !== id),
      [targetColKey]: [...prev[targetColKey], card],
    };
  });

  dragCard.current = null;
  dragOver.current = null;
}
```

### Step 3 — Keyboard fallback
```jsx
function moveCard(cardId, fromCol, direction) {
  const COL_ORDER = ['todo', 'inProgress', 'done'];
  const fromIdx   = COL_ORDER.indexOf(fromCol);
  const toIdx     = fromIdx + direction;
  if (toIdx < 0 || toIdx >= COL_ORDER.length) return;
  const toCol = COL_ORDER[toIdx];
  setColumns((prev) => {
    const card = prev[fromCol].find((c) => c.id === cardId);
    return {
      ...prev,
      [fromCol]: prev[fromCol].filter((c) => c.id !== cardId),
      [toCol]: [...prev[toCol], card],
    };
  });
}
```

---

## Optimizations Implemented

### Drag tracking in `useRef` — no re-renders during drag
**What we did:** `dragCard.current` and `dragOver.current` are refs, not state.
**Why it matters:** During a drag, `dragover` fires tens of times per second. If the target column were stored in state, the entire board would re-render on every `dragover` event — 60 re-renders per second while the user moves the cursor. Refs store mutable values without triggering renders.
**Interview signal:** Distinguishing between "state that drives rendering" and "bookkeeping that shouldn't". Refs are for the latter.

### `e.preventDefault()` in `onDragOver` — the non-obvious requirement
**What we did:** Every column's `onDragOver` handler calls `e.preventDefault()`.
**Why it matters:** Without this, the browser's default behavior is to cancel the drop (signal "no drop allowed"). `e.preventDefault()` in `dragover` is the only way to make `drop` fire.
**Interview signal:** Knowing this is the most common mistake in native DnD implementations — it "just doesn't work" without it.

### Immutable column update — spread + filter
**What we did:** `setColumns((prev) => ({ ...prev, [source]: prev[source].filter(...), [target]: [...prev[target], card] }))`.
**Why it matters:** Mutating `prev[source].splice(...)` would modify the existing array — React might not detect the change, and undo/redo (history) would be broken.
**Interview signal:** Immutable state updates for collections.

### Keyboard fallback for accessibility
**What we did:** Each card has "← Move" / "Move →" buttons (visible or keyboard-only) that call `moveCard(id, col, ±1)`.
**Why it matters:** HTML5 DnD is completely inaccessible to keyboard-only and AT users. WCAG 2.1 SC 2.1.1 requires all functionality be achievable by keyboard.
**Interview signal:** Treating DnD as a progressive enhancement, not the only interaction model.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| `dragover` | Forgets `e.preventDefault()` — drop never fires | Always calls `e.preventDefault()` |
| Drag tracking | `useState` for dragged card — re-renders on every `dragover` | `useRef` — no renders during drag |
| State update | Array splice (mutation) | Immutable filter + spread |
| Keyboard | Not considered | Move buttons or ArrowLeft/Right keyboard fallback |
| Visual feedback | No indicator of drop target | Active column highlighted with CSS `dragover` class |
| Card position | Appended to end of column | Insert at drop position (bonus: index-aware insertion) |

---

## Common Pitfalls to Avoid

- **No `e.preventDefault()` in `onDragOver`:** The drop event silently never fires — the most common native DnD bug.
- **`useState` for drag state:** Causes re-renders on every `dragover` event — use `useRef`.
- **Mutating columns array directly:** `column.push(card)` won't trigger React re-renders.
- **No keyboard fallback:** HTML5 DnD is keyboard-inaccessible — always pair with arrow buttons.

---

## Key Takeaways

- `e.preventDefault()` in `onDragOver` is required to enable drops — without it, nothing works.
- Track dragging metadata in `useRef` — `dragCard.current` — not state, to avoid re-renders.
- Column state update: filter source + spread target, all in one immutable `setColumns` call.
- Keyboard fallback (← →) is required for accessibility — DnD is mouse/touch only natively.
- `dragenter`/`dragleave` for visual feedback; `drop` for the actual state mutation.
