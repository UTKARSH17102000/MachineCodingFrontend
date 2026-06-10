# Multiselect Dropdown — Interview Guide

> **Category:** Form Control · **Difficulty:** Medium

---

## What This Question Tests

Multiselect Dropdown combines several UI challenges: toggle-based selection state, chip display for selected items, search filtering, select-all/deselect-all, click-outside to close, and keyboard navigation. The interviewer measures whether you can decompose these into clean, independent state slices without entangling them — and whether you reach for `useMemo` on the filtered list rather than filtering on every render.

---

## Starting Point (First 2 Minutes)

1. **State inventory:** "I have three state slices: `isOpen` (boolean), `selected` (Set of ids for O(1) lookup), `search` (string for filter input). Everything else is derived."
2. **`Set` for selection:** "Using a `Set` for selected ids gives O(1) add/remove/has — better than `array.includes()` for large option lists."
3. **Click-outside:** "I'll use a `useRef` on the wrapper and attach a `document.mousedown` listener in a `useEffect` — don't forget cleanup."
4. **`useMemo` for filtered options:** "Filter runs on every keystroke — I'll wrap it in `useMemo([options, search])` so it only recomputes when inputs change."

---

## What the Interviewer is Looking For

- `Set` (or at minimum an array) for `selected` — not scattered boolean flags.
- `useMemo` for filtered options.
- **Search input** that filters by label, with case-insensitive matching.
- **Select All / Deselect All** toggle.
- **Chip display** in the trigger showing selected items, with individual chip removal.
- **Click-outside** to close the dropdown.
- `aria-multiselectable="true"` on the listbox; `aria-selected` on each option.

---

## Recommended Approach

### Step 1 — State
```jsx
const [isOpen, setIsOpen] = useState(false);
const [selected, setSelected] = useState(new Set()); // Set<id>
const [search, setSearch] = useState('');
const wrapperRef = useRef(null);
```

### Step 2 — Filtered options
```jsx
const filtered = useMemo(() =>
  options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase())),
  [options, search]
);
```

### Step 3 — Toggle selection (Set-based)
```jsx
function toggle(id) {
  setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
}
```

### Step 4 — Click-outside listener
```jsx
useEffect(() => {
  function handler(e) {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);
```

### Step 5 — Select All
```jsx
const allSelected = filtered.length > 0 && filtered.every((opt) => selected.has(opt.id));
function toggleAll() {
  setSelected((prev) => {
    const next = new Set(prev);
    if (allSelected) filtered.forEach((o) => next.delete(o.id));
    else filtered.forEach((o) => next.add(o.id));
    return next;
  });
}
```

---

## Optimizations Implemented

### `Set` for selected items — O(1) lookup
**What we did:** `selected` is a `Set<string>` — `selected.has(id)` is O(1) vs. `selectedArray.includes(id)` which is O(n).
**Why it matters:** With 500 options and 100 selected, checking whether each visible option is selected requires 500 × O(1) = O(500) vs. 500 × O(100) = O(50,000) operations.
**Interview signal:** Choosing the right data structure based on the access pattern.

### `useMemo` on filtered options
**What we did:** `useMemo(() => options.filter(...), [options, search])` only recomputes when `options` or `search` changes.
**Why it matters:** Without memoization, filtering runs on every parent re-render — including hover, focus, and any ancestor state changes.
**Interview signal:** Identifying where computation is expensive and applying `useMemo` precisely.

### `useEffect` with cleanup for click-outside
**What we did:** `document.addEventListener('mousedown', handler)` in a `useEffect` with `return () => removeEventListener` cleanup.
**Why it matters:** Without cleanup, every re-mount adds another listener — multiple listeners accumulate and the dropdown never reliably closes.
**Interview signal:** Treating global event listeners as resources that must be released.

### Select All scoped to filtered results
**What we did:** "Select All" operates on the current filtered set, not the full options list. If search is active, only visible options are selected/deselected.
**Why it matters:** Selecting all options when a search filter is active but selecting unfiltered options would be unexpected UX.
**Interview signal:** Thinking about the interaction between independent state slices.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Selection state | `boolean[]` parallel to options array | `Set<id>` — O(1) add/remove/has |
| Filter | `options.filter(...)` inline in JSX | `useMemo` — recomputes only on deps change |
| Click-outside | `onBlur` on the trigger (misses clicks in dropdown) | `document.mousedown` on `useRef` wrapper |
| Select All | "Select all" always selects every option | Scoped to current filtered results |
| Chips | Renders all selected as text | Individual chips with × removal |
| Keyboard | Not implemented | Arrow keys, Enter to select, Escape to close |

---

## Common Pitfalls to Avoid

- **Using `onBlur` for click-outside:** `onBlur` fires when focus leaves the trigger, but clicking inside the dropdown panel also triggers it — closing the dropdown before the click registers.
- **Array instead of Set for selection:** `array.includes(id)` is O(n) — in a checkbox list, this runs once per option per render.
- **Not clearing search on close:** If the search input retains its value when closed, reopening shows a filtered list unexpectedly.
- **Select All selecting unfiltered items:** When search is active, Select All should only affect visible (filtered) options.

---

## Key Takeaways

- `Set<id>` for selection state: O(1) has/add/delete — the structural choice that pays off at scale.
- `useMemo` on filtered options: filter only recomputes on actual data changes, not every render.
- Click-outside via `document.mousedown` + `wrapperRef.contains(e.target)` — the canonical pattern.
- Select All scoped to the current filtered view — think about state slice interactions.
- Chip display with individual × removal is the UX detail that interviewers look for.
