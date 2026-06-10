# Progress Bar — Interview Guide

> **Category:** UI Component · **Difficulty:** Easy

---

## What This Question Tests

Progress Bar is an ARIA fundamentals test. The interviewer wants to see `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` — the correct semantic pattern for indicating percentage-based progress. Secondary tests include handling the three variants (determinate, indeterminate, stepped) and knowing that the indeterminate animation is CSS-only — no JavaScript interval needed.

---

## Starting Point (First 2 Minutes)

1. **Clarify variants upfront:** "Are we building determinate (0–100%), indeterminate (loading with unknown duration), or stepped (discrete segments)? I'll build all three since they're commonly requested together."
2. **ARIA annotation first:** "For determinate: `role='progressbar'`, `aria-valuenow`, `aria-valuemin='0'`, `aria-valuemax='100'`. For indeterminate, omit `aria-valuenow` per the ARIA spec."
3. **Indeterminate animation:** "I'll use a CSS `@keyframes` animation on the fill element — no `setInterval`."
4. **Value clamping:** "I'll clamp the incoming value to [0, 100] — don't trust the prop."

---

## What the Interviewer is Looking For

- `role="progressbar"` on the track element.
- `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` for determinate.
- Indeterminate variant omits `aria-valuenow` and uses CSS animation.
- Stepped variant with distinct segments and per-segment `aria-label`.
- Value clamping so props outside [0, 100] don't break the layout.
- Visual width driven by `style={{ width: '${value}%' }}` — not a CSS class per percentage.

---

## Recommended Approach

### Step 1 — Determinate bar
```jsx
<div
  role="progressbar"
  aria-valuenow={clampedValue}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={label}
  className={styles.track}
>
  <div className={styles.fill} style={{ width: `${clampedValue}%` }} />
</div>
```

### Step 2 — Indeterminate bar
```jsx
<div role="progressbar" aria-label="Loading" className={styles.track}>
  <div className={`${styles.fill} ${styles.indeterminate}`} />
</div>
```
```css
.indeterminate {
  width: 40%;
  animation: slide 1.4s ease-in-out infinite;
}
@keyframes slide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
```

### Step 3 — Stepped bar
```jsx
{steps.map((step, i) => (
  <div
    key={i}
    className={`${styles.segment} ${i < completedSteps ? styles.filled : ''}`}
    role="progressbar"
    aria-valuenow={i < completedSteps ? 1 : 0}
    aria-valuemin={0}
    aria-valuemax={1}
    aria-label={`Step ${i + 1} of ${steps.length}`}
  />
))}
```

---

## Optimizations Implemented

### CSS `@keyframes` for indeterminate — zero JavaScript
**What we did:** The indeterminate animation is a CSS `@keyframes` that slides the fill bar from left to right in a loop — no `setInterval`, no state updates.
**Why it matters:** A `setInterval`-driven animation updates React state 60 times per second, causing 60 re-renders per second. CSS animations run on the compositor thread — zero JS overhead.
**Interview signal:** Preferring CSS for pure visual effects is a strong lead signal.

### `clamp(value, 0, 100)` before rendering
**What we did:** `const clamped = Math.min(100, Math.max(0, value))` before using the value in `style` or `aria-valuenow`.
**Why it matters:** A value of `120` would render `width: 120%` — breaking out of the container. Input from external APIs is never guaranteed to be within range.
**Interview signal:** Defensive programming at component boundaries.

### Omit `aria-valuenow` for indeterminate per ARIA spec
**What we did:** The indeterminate variant does not include `aria-valuenow`.
**Why it matters:** The ARIA spec states: "If the progress bar is in an indeterminate state, authors MUST omit the `aria-valuenow` attribute." Including it (e.g., `aria-valuenow={undefined}`) is different from omitting it.
**Interview signal:** Actually reading the ARIA spec, not just guessing.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| ARIA | No ARIA at all | `role`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` |
| Indeterminate | `setInterval` + state | CSS `@keyframes` — zero JS |
| Value safety | Passes raw prop to `style` | `Math.min(100, Math.max(0, value))` before use |
| Stepped | Not implemented | Segment array with per-segment ARIA |
| Width | Hardcoded CSS classes (`w-25`, `w-50`) | Inline `style={{ width: '${value}%' }}` |
| Label | Missing | `aria-label` or `aria-labelledby` |

---

## Common Pitfalls to Avoid

- **`setInterval` for indeterminate animation:** Costs 60 re-renders/sec for a purely visual effect — CSS animation is the correct tool.
- **Setting `aria-valuenow` on indeterminate:** The spec says to omit it — undefined in a React prop is fine.
- **Not clamping the value:** `width: 120%` breaks the layout; `width: -5%` renders as 0 but passes a confusing value to `aria-valuenow`.
- **Using width classes instead of inline style:** You can't generate `width: 73%` with Tailwind/CSS modules without hundreds of classes.

---

## Key Takeaways

- `role="progressbar"` + `aria-valuenow/min/max` — the three ARIA attributes that make this semantic.
- CSS `@keyframes` for the indeterminate animation — never use `setInterval` for visual-only effects.
- Clamp the input value at the component boundary before it touches the DOM.
- Omit `aria-valuenow` for the indeterminate variant — this matches the ARIA spec exactly.
- Stepped variant: each segment is its own `role="progressbar"` with binary (0/1) values.
