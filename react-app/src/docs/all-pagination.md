# All Pagination Types — Interview Guide

> **Category:** Data Display · **Difficulty:** Medium

---

## What This Question Tests

"All Pagination Types" tests whether you can recognize the three distinct pagination UX patterns — page numbers, Load More, and Jump-to-page — and articulate the trade-offs between them. A lead engineer thinks about when to use each pattern (SEO, UX, content type), not just how to implement them. The interviewer wants code organization: a shared hook or helper, and separate, focused components per type.

---

## Starting Point (First 2 Minutes)

1. **Name and contrast the three patterns upfront:**
   - **Page numbers:** Bookmarkable, great for search results; users can jump to any page.
   - **Load More:** Good for social feeds; simple, but loses position on refresh.
   - **Jump-to-page:** Useful for large datasets where users know their target page; common in data tables.
2. **Shared logic:** "All three share `page`, `pageSize`, `totalItems`, and data fetching — I'll extract a `usePagination` hook."
3. **Separate components:** "Each pattern is a separate component — they share the hook but have completely different UIs."

---

## What the Interviewer is Looking For

- **All three patterns** implemented and working.
- **`usePagination` hook** (or similar) shared between implementations.
- **Page numbers:** ellipsis, prev/next, current page highlight.
- **Load More:** append items, disable button when no more, loading state.
- **Jump-to-page:** input validation (1 ≤ page ≤ totalPages), debounced or on-submit.
- Clean **code organization** — not three copies of the same fetch logic.

---

## Recommended Approach

### Shared `usePagination` hook
```jsx
function usePagination({ pageSize = 10 } = {}) {
  const [page, setPage]       = useState(1);
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  async function goToPage(targetPage) {
    setLoading(true);
    const data = await fetchItems(targetPage, pageSize);
    setItems(data.items);
    setTotal(data.total);
    setPage(targetPage);
    setLoading(false);
  }

  return { page, items, total, totalPages, loading, goToPage };
}
```

### Load More variant — append, don't replace
```jsx
// Accumulate items instead of replacing them
setItems((prev) => [...prev, ...data.items]);
```

### Jump-to-page — validate input
```jsx
function handleJump(e) {
  e.preventDefault();
  const target = Number(inputRef.current.value);
  if (target >= 1 && target <= totalPages) goToPage(target);
}
```

---

## Optimizations Implemented

### `usePagination` — shared logic, zero duplication
**What we did:** All three components import `usePagination` — fetch logic, page arithmetic, and loading state live in one place.
**Why it matters:** Without a shared hook, changing the `pageSize` or adding error handling requires three separate edits. DRY at the hook level, not the component level.
**Interview signal:** Extracting reusable logic into a custom hook — a lead-level React pattern.

### Load More appends rather than replacing
**What we did:** `setItems((prev) => [...prev, ...newItems])` accumulates pages.
**Why it matters:** Replacing items on Load More would scroll the user back to the top of the list and lose their reading position.
**Interview signal:** Thinking about the user's spatial context when adding content.

### Jump-to-page validates before navigation
**What we did:** `if (target >= 1 && target <= totalPages)` guards the `goToPage` call. Invalid inputs do nothing (or show an error).
**Why it matters:** Navigating to page 0 or page 10000 would cause API errors or render an empty page.
**Interview signal:** Input validation at the component boundary — don't trust user input.

### Trade-off discussion (the real "lead" signal)
- **Page numbers:** Best when users want random access; supports bookmarking; works with URL query params (`?page=3`).
- **Load More:** Best for infinite/social content; no URL state; loses position on reload.
- **Jump-to-page:** Best for data tables where users know their target; paired with page numbers for hybrid UIs.

**Interview signal:** Showing you understand when to use each pattern — not just how to build them.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Code structure | Three components with copy-pasted fetch logic | `usePagination` hook shared by all three |
| Load More | Replaces items on each page | Appends — user doesn't lose position |
| Jump-to-page | No input validation | `1 ≤ target ≤ totalPages` guard |
| Trade-offs | Builds all three without discussion | Articulates when to use each pattern |
| URL sync | Not considered | Mentions `?page=N` for page numbers |
| Loading state | Not shown | Disables controls while fetching |

---

## Common Pitfalls to Avoid

- **Copy-pasting fetch logic:** Three implementations with identical `fetch`, `setLoading`, `setItems` patterns — a hook fixes this.
- **Load More replacing items:** Users lose scroll position; the list resets to the top.
- **Jump-to-page without validation:** Typing "abc" or "99999" crashes the fetch.
- **Not disabling controls while loading:** Clicking "Next" twice before the first page resolves leads to stale state.

---

## Key Takeaways

- Name the three patterns and their trade-offs before writing code — this demonstrates product thinking.
- `usePagination` hook is the code organization signal: logic shared, UI separate.
- Load More must append (`prev => [...prev, ...new]`), never replace.
- Jump-to-page needs validation — clamp or reject values outside `[1, totalPages]`.
- URL synchronization (`?page=N`) is the production consideration worth mentioning for page numbers.
