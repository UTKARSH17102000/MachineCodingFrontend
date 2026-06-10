# Accordion — Interview Guide

> **Category:** UI Component · **Difficulty:** Easy

---

## What This Question Tests

Accordion is a classic accessibility test — the interviewer wants to see correct ARIA roles, keyboard navigation, and the CSS height animation trick (the non-obvious correct approach). It also tests whether you think about the single-open vs. multi-open configuration as a first-class design decision, and whether you reach for the simplest state model.

---

## Starting Point (First 2 Minutes)

1. **Clarify two key things:** "Single-open (accordion) or multi-open (disclosure group)? Static items or dynamic from props?"
2. **State model:** For single-open: `openId` (a string or null). For multi-open: `openIds` (a Set). Don't over-engineer — start with a single-open default.
3. **Animation strategy:** Mention `max-height` CSS transition upfront. "I'll avoid `height: auto` animation since it's not animatable — I'll use `max-height: 0 → max-height: 500px` with `overflow: hidden` and `transition`."
4. **Data shape:** `[{ id, title, content }]` — map over props, no hardcoded JSX per item.

---

## What the Interviewer is Looking For

- **Correct ARIA:** `aria-expanded` on the trigger button, `aria-controls` pointing to the panel `id`.
- **Keyboard navigation:** Enter/Space to toggle (buttons handle this natively), arrow keys to move between headers.
- **CSS max-height trick** — not `display: none/block` (no animation) or `height` (not animatable from `auto`).
- **Single vs. multi mode** as a prop — `allowMultiple?: boolean`.
- **Unique IDs** for each panel for `aria-controls` / `id` linking.

---

## Recommended Approach

### Step 1 — Define state
```jsx
const [openId, setOpenId] = useState(null); // or a Set for multi-open
```

### Step 2 — Map items to JSX
```jsx
{items.map(({ id, title, content }) => {
  const isOpen = openId === id;
  return (
    <div key={id} className={styles.item}>
      <button
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        onClick={() => setOpenId(isOpen ? null : id)}
      >
        {title}
        <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} aria-hidden="true">▼</span>
      </button>
      <div
        id={`panel-${id}`}
        role="region"
        aria-labelledby={`btn-${id}`}
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
      >
        <div className={styles.panelInner}>{content}</div>
      </div>
    </div>
  );
})}
```

### Step 3 — CSS max-height animation
```css
.panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms ease;
}
.panelOpen {
  max-height: 500px; /* larger than any realistic content */
}
```

---

## Optimizations Implemented

### `max-height` CSS transition — no JavaScript height measurement
**What we did:** Use `max-height: 0 → 500px` with `overflow: hidden` instead of measuring `scrollHeight` in JavaScript.
**Why it matters:** The JS approach requires `useRef` + `useLayoutEffect` + state update, which forces a layout recalculation and re-render. CSS transitions are GPU-composited and need no JS.
**Interview signal:** Knowing that `height: auto` is not animatable and that `max-height` is the pragmatic workaround.

### `allowMultiple` prop for mode switching
**What we did:** A single `allowMultiple` boolean switches from `openId: string | null` to `openIds: Set<string>`.
**Why it matters:** Same component, different UX contract — clean API without duplicating the component.
**Interview signal:** Designing for configurability without over-engineering.

### Keyboard arrow navigation between headers
**What we did:** `onKeyDown` on each trigger listens for `ArrowDown`/`ArrowUp` and moves focus to the next/previous trigger via `querySelectorAll('[role="button"]')`.
**Why it matters:** The ARIA Accordion Pattern specifies that arrow keys move focus between headers — users should not have to Tab through every panel content to reach the next header.
**Interview signal:** Reading the ARIA spec and implementing beyond just `aria-expanded`.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Animation | `display: none/block` — no animation | `max-height` CSS transition — smooth open/close |
| State | Separate `isOpen` boolean per item | Single `openId` or `Set<id>` — O(1) lookup |
| ARIA | Missing or wrong | `aria-expanded`, `aria-controls`, `role="region"` |
| Keyboard | Not implemented | Arrow keys move between headers; Enter/Space toggle (native) |
| Configuration | Hardcoded single-open | `allowMultiple` prop switches behaviour |
| Data | Hardcoded JSX per item | Maps over `items` prop — fully dynamic |

---

## Common Pitfalls to Avoid

- **`display: none` toggle:** No animation, and it removes content from the accessibility tree — screen readers can't read closed panel content.
- **Storing `isOpen` per item in state array:** This mutates an array of objects unnecessarily. A single `openId` string is simpler and has O(1) lookup.
- **Missing `aria-expanded`:** This is the primary signal for screen readers about the open/closed state. Without it, the toggle is invisible to AT.
- **Not using native `<button>`:** Custom `div` triggers require adding `tabIndex`, `role`, and `onKeyDown` for Enter/Space — a `<button>` gives all of this for free.

---

## Key Takeaways

- `max-height` transition is the correct, CSS-only animation technique — name it in the first minute.
- `aria-expanded` on the trigger + `aria-controls` pointing to the panel `id` is the minimum correct ARIA implementation.
- Single `openId` state (or a `Set` for multi-open) is cleaner than per-item boolean flags.
- `allowMultiple` as a prop makes the same component serve two UX patterns without code duplication.
- Keyboard navigation (arrow keys between headers) is the distinguishing "lead" signal most candidates skip.
