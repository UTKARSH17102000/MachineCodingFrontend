# Infinite Scroll — Interview Guide

> **Category:** Data Display · **Difficulty:** Medium

---

## What This Question Tests

Infinite scroll tests your knowledge of `IntersectionObserver` — the correct modern API for detecting when a sentinel element enters the viewport. The interviewer wants to see you avoid the naive `scroll` event listener approach, handle the loading lock (prevent duplicate API calls), show skeleton loaders during fetches, and handle the end-of-data state. Cleanup on unmount is a must.

---

## Starting Point (First 2 Minutes)

1. **IntersectionObserver vs. scroll listener:** "I'll use `IntersectionObserver` — it's event-driven, not polling-based. No frame-rate concerns, no `requestAnimationFrame`, no debouncing needed."
2. **Sentinel element:** "I'll render a `<div ref={sentinelRef} />` at the bottom of the list. The IO watches it. When it enters the viewport, I load the next page."
3. **Loading lock:** "A `isLoading` flag (or ref) prevents duplicate fetches if the user scrolls past the sentinel before the current fetch resolves."
4. **State:** `items[]`, `page` (next page to fetch), `isLoading` (boolean), `hasMore` (boolean).

---

## What the Interviewer is Looking For

- `IntersectionObserver` — **not** a `scroll` event listener.
- Sentinel `<div>` at the bottom of the list as the IO target.
- `isLoading` guard to prevent concurrent fetches.
- Skeleton loaders while data is being fetched.
- `hasMore` flag — when `false`, the IO is disconnected and no more fetches happen.
- `disconnect()` called in `useEffect` cleanup.

---

## Recommended Approach

### Step 1 — State
```jsx
const [items, setItems]       = useState([]);
const [page, setPage]         = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [hasMore, setHasMore]   = useState(true);
const sentinelRef = useRef(null);
```

### Step 2 — Fetch function
```jsx
async function loadMore() {
  if (isLoading || !hasMore) return;
  setIsLoading(true);
  try {
    const data = await fetchPage(page);
    setItems((prev) => [...prev, ...data.items]);
    setHasMore(data.hasMore);
    setPage((p) => p + 1);
  } finally {
    setIsLoading(false);
  }
}
```

### Step 3 — IntersectionObserver
```jsx
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) loadMore(); },
    { rootMargin: '200px' } // load 200px before the sentinel hits viewport
  );
  if (sentinelRef.current) observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore, isLoading]); // re-create when these change to capture latest values
```

### Step 4 — JSX
```jsx
<div className={styles.list}>
  {items.map((item) => <ItemCard key={item.id} {...item} />)}
  {isLoading && <SkeletonList count={3} />}
  {!hasMore && <p className={styles.end}>You've reached the end</p>}
  <div ref={sentinelRef} className={styles.sentinel} />
</div>
```

---

## Optimizations Implemented

### IntersectionObserver with `rootMargin: '200px'`
**What we did:** The IO fires when the sentinel is 200px before the viewport edge — data loads before the user reaches the bottom.
**Why it matters:** Without `rootMargin`, the user sees a flash of empty space before the next batch arrives. Preloading hides the latency.
**Interview signal:** Knowing the `rootMargin` option — not just the default threshold.

### `loadMore` guard: `if (isLoading || !hasMore) return`
**What we did:** Two guards prevent duplicate fetches: `isLoading` prevents concurrent calls; `!hasMore` disconnects the observer after the last page.
**Why it matters:** Without `isLoading`, rapid scrolling triggers multiple simultaneous fetches for the same page, resulting in duplicate items.
**Interview signal:** Treating API calls as resources with a "busy" lock — a standard pattern in data fetching.

### `observer.disconnect()` in `useEffect` cleanup + when `!hasMore`
**What we did:** `disconnect()` is called both in the `useEffect` cleanup (component unmount or dep change) and we stop observing after `hasMore` becomes false.
**Why it matters:** Without disconnect, the observer continues watching the sentinel even after the last page is loaded — triggering `loadMore()` repeatedly (which the `isLoading/hasMore` guards catch, but it's cleaner to stop observing).
**Interview signal:** Treating IO as a resource to be released — analogous to `clearInterval` or `removeEventListener`.

### Skeleton loaders for perceived performance
**What we did:** While `isLoading === true`, render 3 `<Skeleton />` placeholder cards matching the real card dimensions.
**Why it matters:** Skeleton loaders communicate to the user that content is coming — reducing perceived wait time compared to a spinner or empty space.
**Interview signal:** Distinguishing between a loading spinner (ambiguous) and a skeleton (shape-aware — tells the user what kind of content is loading).

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Detection mechanism | `scroll` event + `getBoundingClientRect()` | `IntersectionObserver` — event-driven |
| Debouncing | `scroll` event debounced | Not needed with IO |
| Duplicate fetch guard | May not exist | `isLoading` flag prevents concurrent fetches |
| End state | Loads forever or errors | `hasMore` flag — IO disconnects at end |
| Cleanup | No disconnect | `observer.disconnect()` in useEffect cleanup |
| Loading UX | Spinner at the bottom | Skeleton cards matching real content shape |

---

## Common Pitfalls to Avoid

- **`scroll` event listener:** Fires hundreds of times per second — requires debouncing, `getBoundingClientRect()` computation, and `requestAnimationFrame` scheduling. IO handles all of this natively.
- **Not using `isLoading` guard:** If the user holds the scroll wheel, the IO may fire multiple times before the first fetch resolves — resulting in duplicate data.
- **Observing a new sentinel ref after re-render without disconnecting:** If the sentinel re-mounts, re-create the observer (done automatically by the `useEffect` dep array).
- **Not handling error state:** A failed fetch should reset `isLoading` to `false` and show a "Try again" button — use `finally` to always reset the loading flag.

---

## Key Takeaways

- `IntersectionObserver` is the correct API — not scroll events. Use `rootMargin: '200px'` for preloading.
- Sentinel `<div>` at the bottom of the list is the single IO target.
- Two guards: `isLoading` (no concurrent fetches) and `hasMore` (no fetches after the last page).
- `observer.disconnect()` in `useEffect` cleanup — IO is a resource that must be released.
- Skeleton loaders > spinner: they communicate the shape of the incoming content.
