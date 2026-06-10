# Price Range Slider — Interview Guide

> **Category:** Form Control · **Difficulty:** Medium

---

## What This Question Tests

The price range slider tests your ability to manage two interdependent values (min and max thumbs) that must never cross. It requires custom styling of native `<input type="range">` elements, a CSS technique for the filled track between the thumbs, and collision clamping logic that prevents `min > max`. The interviewer wants to see that you think about the constraint system first, then the rendering.

---

## Starting Point (First 2 Minutes)

1. **Two controlled inputs:** "I'll use two `<input type='range'>` elements — one for min price, one for max. Both share the same `min`/`max` bounds."
2. **Collision logic:** "The constraint is `minValue <= maxValue - GAP` and `maxValue >= minValue + GAP` where `GAP` is the minimum distance (e.g., $10)."
3. **Track fill:** "The filled track between thumbs is a CSS `background: linear-gradient()` on the range track, computed from the current min/max percentages."
4. **Z-index swap:** "When thumbs are at the same position, I need to swap `z-index` so the user can drag either one — mentioning this sets you apart."

---

## What the Interviewer is Looking For

- Two `<input type="range">` stacked with `position: absolute` (or overlaid using CSS).
- **Collision clamping** — `min` can't exceed `max - GAP`; `max` can't go below `min + GAP`.
- **Filled track** — CSS gradient or a `<div>` overlay sized/positioned by the current values.
- **Z-index swap** when thumbs overlap (so the user can still drag either thumb).
- Formatted output — `$200 – $800` display updating live.

---

## Recommended Approach

### Step 1 — State
```jsx
const [range, setRange] = useState({ min: 200, max: 800 });
const TOTAL_MIN = 0, TOTAL_MAX = 1000, GAP = 10;
```

### Step 2 — Collision-safe handlers
```jsx
function handleMin(e) {
  const val = Number(e.target.value);
  setRange((prev) => ({ ...prev, min: Math.min(val, prev.max - GAP) }));
}
function handleMax(e) {
  const val = Number(e.target.value);
  setRange((prev) => ({ ...prev, max: Math.max(val, prev.min + GAP) }));
}
```

### Step 3 — Track fill via inline CSS variables
```jsx
const minPct = ((range.min - TOTAL_MIN) / (TOTAL_MAX - TOTAL_MIN)) * 100;
const maxPct = ((range.max - TOTAL_MIN) / (TOTAL_MAX - TOTAL_MIN)) * 100;
// Applied to the container:
style={{ '--min-pct': `${minPct}%`, '--max-pct': `${maxPct}%` }}
```
```css
.track::before {
  left: var(--min-pct);
  right: calc(100% - var(--max-pct));
}
```

### Step 4 — Z-index swap
```jsx
style={{ zIndex: range.min > TOTAL_MAX - 100 ? 5 : 3 }}
/* Or: give the min thumb higher z-index when both are near max */
```

---

## Optimizations Implemented

### CSS custom properties for the track fill — no JS DOM manipulation
**What we did:** The filled track width and offset are driven by CSS variables set via inline `style` on the container. The fill `::before` pseudo-element reads them.
**Why it matters:** An alternative is to calculate the `left` and `width` of a `<div>` overlay in JavaScript and set them as inline styles on the overlay. The CSS variable approach keeps the render cleaner — the container style holds the values, CSS handles the visual.
**Interview signal:** Using CSS variables as a "data bus" between React state and CSS — a modern, composable pattern.

### `GAP` constant for minimum thumb distance
**What we did:** `const GAP = 10` prevents the thumbs from touching or crossing.
**Why it matters:** Without a gap, a user can set min=500 and max=500, which is a degenerate range — either meaningless or confusing for downstream filtering logic.
**Interview signal:** Thinking about the invariants of the data model, not just the visual.

### Collision resolved in the setter, not on blur
**What we did:** `Math.min(val, prev.max - GAP)` runs synchronously in the `onChange` handler.
**Why it matters:** If you only validate on blur (when the user leaves the input), they see a broken state during dragging — two thumbs crossing. Real-time clamping keeps the invariant intact at all times.
**Interview signal:** Validating state transitions at the point of mutation, not deferred.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Input approach | Single custom element with drag events | Two native `<input type="range">` elements |
| Collision handling | Validates on blur or ignores crossing | `Math.min/max` clamping in `onChange` |
| Track fill | Not implemented or uses hardcoded width | CSS custom properties driven by current values |
| Z-index at overlap | Not handled — thumbs get stuck | `z-index` swap when min thumb near max |
| Display | Separate `<span>` updated by JS | Derived from state — `$${range.min} – $${range.max}` |
| GAP constraint | Not implemented | Minimum gap constant prevents degenerate range |

---

## Common Pitfalls to Avoid

- **Not handling thumb crossing:** Without clamping, `min > max` is possible, and the UI breaks visually and semantically.
- **Custom drag implementation instead of native `<input type="range">`:** Native inputs are keyboard-navigable, mobile-friendly, and accessible by default. Custom drag handlers break all of this.
- **Recalculating percentages in JSX instead of CSS:** Inline `style={{ left: '${minPct}%' }}` on the overlay is fine, but CSS variables on the container are cleaner and can be animated with CSS transitions.
- **Not styling the native thumb and track:** Raw `<input type="range">` looks inconsistent across browsers — CSS vendor prefixes are needed for cross-browser thumb/track styling.

---

## Key Takeaways

- Two native `<input type="range">` elements overlaid with absolute positioning is the correct approach — never roll a custom drag handler.
- The core logic is one constraint: `min ≤ max - GAP`. Build the setter around this invariant.
- CSS custom properties (`--min-pct`, `--max-pct`) on the container drive the track fill — clean separation of state and presentation.
- Z-index swap at thumb overlap prevents the UI from locking — a production polish detail.
- Format the output live from state: `$${range.min.toLocaleString()} – $${range.max.toLocaleString()}`.
