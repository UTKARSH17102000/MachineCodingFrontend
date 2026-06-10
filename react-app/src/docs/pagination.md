# Pagination — Interview Guide

> **Category:** Data Display · **Difficulty:** Easy

---

## What This Question Tests

Pagination tests your ability to derive display state from a single source of truth (`currentPage` + `totalItems` + `pageSize`) rather than storing redundant state. It evaluates how you handle boundary conditions (first/last page, empty data), ellipsis logic for large page ranges, and whether you think about the component as a purely controlled, stateless display layer.

---

## Starting Point (First 2 Minutes)

1. **Clarify requirements out loud:** "How many items per page? Fixed or configurable? Do we need ellipsis for large page counts? API-driven or client-side?"
2. **State model first:** Only two pieces of state — `currentPage` and `data` (or `totalItems` if server-paginated). Everything else (`totalPages`, `visiblePages`, `hasNext`) is derived.
3. **Sketch the algorithm:** "I'll compute `totalPages = Math.ceil(total / pageSize)`, then determine which page numbers to show with ellipsis — I'll cap it at 7 visible slots."
4. **API boundary:** Clarify whether data is already in memory (client-side) or you fetch per page (server-side). This choice affects where state lives.

---

## What the Interviewer is Looking For

- **Derives, not stores:** `totalPages`, `pageSlice`, `visiblePages` computed — not stored in `useState`.
- **Handles edge cases proactively:** Empty data set, single page (no controls), last page with fewer items.
- **Ellipsis logic:** Shows `[1, …, 4, 5, 6, …, 20]` rather than all 20 buttons.
- **Controlled component design:** Parent owns `currentPage`; Pagination is a dumb component.
- **Accessibility:** Prev/Next buttons have `aria-label`, current page has `aria-current="page"`.

---

## Recommended Approach

### Step 1 — Define the state
```jsx
const [currentPage, setCurrentPage] = useState(1);
const totalPages = Math.ceil(items.length / PAGE_SIZE);
```

### Step 2 — Slice the data
```jsx
const pageData = useMemo(() => {
  const start = (currentPage - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}, [items, currentPage]);
```

### Step 3 — Compute visible page buttons
Write a `getVisiblePages(current, total)` function that returns an array of numbers and `'ellipsis'` sentinels. Keep the window ±2 pages around current with fixed first/last always showing.

### Step 4 — Render
Map the visible pages array, rendering either a button or a `<span>…</span>` for ellipsis. Disable Prev/Next at boundaries.

---

## Optimizations Implemented

### `useMemo` for page slice and visible pages
**What we did:** Both `pageData` and `visiblePages` are wrapped in `useMemo`.
**Why it matters:** Without memoization, every parent re-render recomputes the slice and rebuilds the page number array — O(n) work on potentially thousands of items.
**Interview signal:** Knowing when `useMemo` pays off (expensive derivation, referential stability for children) vs. when it's premature optimization.

### Controlled component pattern
**What we did:** `Pagination` receives `currentPage`, `totalPages`, and `onPageChange` as props.
**Why it matters:** Parent component owns the "truth" — it can sync pagination to a URL, reset page on filter change, or save page in session storage without touching `Pagination`.
**Interview signal:** Understanding the controlled/uncontrolled trade-off; controlled components are easier to test and integrate.

### Ellipsis algorithm with constant 7-slot window
**What we did:** The visible pages array always has at most 7 items — `[1, '…', prev, curr, next, '…', last]`.
**Why it matters:** Prevents layout shift as the user navigates, since the control bar width stays constant.
**Interview signal:** Thinking about layout stability — a sign you've built paginated UIs in production.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| State | Stores `totalPages`, `hasPrev`, `hasNext` in state | Derives them all from `currentPage` and `items.length` |
| Ellipsis | Shows all page numbers or skips ellipsis | Implements `[1, …, n-1, n, n+1, …, last]` window |
| Performance | Recomputes slice on every render | `useMemo` on page slice and page number array |
| Accessibility | Plain `<button>` with numbers | `aria-current="page"`, `aria-label` on Prev/Next |
| API-readiness | Hard-codes client-side only | Designs interface that works for server pagination too |
| Edge cases | Breaks on 0 items or 1 page | Handles empty state and hides controls when `totalPages === 1` |

---

## Common Pitfalls to Avoid

- **Storing derived state:** Never put `totalPages` or `hasPrev` in `useState`. They're always computable.
- **Off-by-one in slice:** `slice(start, start + PAGE_SIZE)` — not `start + PAGE_SIZE - 1`.
- **Not resetting page on data change:** If a parent filter changes the item list, reset `currentPage` to 1.
- **Hardcoding PAGE_SIZE:** Accept it as a prop or constant, not magic number scattered in JSX.

---

## Key Takeaways

- Single state variable (`currentPage`) drives everything — all else is derived.
- Ellipsis algorithm is the "lead" signal — most juniors skip it; mentioning it earns points even if you don't implement it first.
- Controlled component design separates concerns cleanly and makes the component reusable.
- `useMemo` on the page slice matters at scale — mention it even if the demo data is small.
- Always clarify client-side vs. server-side pagination upfront — the API contract differs significantly.
