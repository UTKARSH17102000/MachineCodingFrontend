# Carousel — Interview Guide

> **Category:** UI Component · **Difficulty:** Medium

---

## What This Question Tests

Carousel tests animation technique (CSS transform vs. JS), auto-play with pause-on-hover/focus (UX + accessibility), swipe gesture handling, and ARIA live regions for announcing slide changes to screen readers. The interviewer wants to see that you think about the infinite loop illusion (how slide 0 connects to slide N without a visible jump), and that autoplay respects user preferences and interaction.

---

## Starting Point (First 2 Minutes)

1. **Animation approach:** "I'll use CSS `transform: translateX()` for slide transitions — no `left` positioning, no JavaScript animation. CSS transform is GPU-composited and doesn't trigger layout."
2. **Infinite loop:** "For the infinite effect, I'll either duplicate the first and last slides (clone approach) or use a modulo index. Modulo is simpler for this scope."
3. **Auto-play:** "Auto-play uses `setInterval`. I'll pause it on `mouseenter` and `focus` — and respect `prefers-reduced-motion`."
4. **Swipe:** "Pointer events (`pointerdown`, `pointermove`, `pointerup`) — more reliable than touch events, works on desktop too."

---

## What the Interviewer is Looking For

- CSS `transform: translateX(-${activeIndex * 100}%)` for slide position.
- `setInterval` for auto-play with `clearInterval` cleanup.
- **Pause on hover AND focus** — `mouseenter/leave` + `focusin/out`.
- **Swipe support** — horizontal drag threshold > 50px triggers prev/next.
- `aria-live="polite"` region announcing the current slide.
- Dot indicators with `aria-label` ("Go to slide 3 of 5").
- `prefers-reduced-motion` — disable auto-play if the user prefers reduced motion.

---

## Recommended Approach

### Step 1 — State
```jsx
const [activeIndex, setActiveIndex] = useState(0);
const [paused, setPaused] = useState(false);
const total = slides.length;
```

### Step 2 — Auto-play
```jsx
useEffect(() => {
  if (paused) return;
  const id = setInterval(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, interval);
  return () => clearInterval(id);
}, [paused, total, interval]);
```

### Step 3 — CSS slide transform
```jsx
<div
  className={styles.track}
  style={{ transform: `translateX(-${activeIndex * 100}%)`, transition: 'transform 400ms ease' }}
>
  {slides.map((slide, i) => (
    <div key={i} className={styles.slide}>{slide}</div>
  ))}
</div>
```

### Step 4 — Swipe with pointer events
```jsx
const pointerStart = useRef(null);
function onPointerDown(e) { pointerStart.current = e.clientX; }
function onPointerUp(e) {
  if (pointerStart.current === null) return;
  const delta = e.clientX - pointerStart.current;
  if (Math.abs(delta) > 50) {
    delta < 0 ? goNext() : goPrev();
  }
  pointerStart.current = null;
}
```

### Step 5 — ARIA live region
```jsx
<div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
  Slide {activeIndex + 1} of {total}: {slides[activeIndex].title}
</div>
```

---

## Optimizations Implemented

### CSS `transform: translateX()` — no layout recalculation
**What we did:** The slide track moves via `transform: translateX(-${i * 100}%)` with a CSS transition.
**Why it matters:** Changing `left` or `margin-left` triggers layout (reflow) on every frame. `transform` is composited by the GPU — the browser moves pixels without recalculating the layout tree. Result: smoother animation, especially on mobile.
**Interview signal:** Understanding the browser rendering pipeline — layout → paint → composite.

### `prefers-reduced-motion` check
**What we did:** Auto-play and the CSS transition are disabled when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true.
**Why it matters:** Vestibular disorders make moving content physically nauseating. Auto-playing carousels are a WCAG 2.1 AA failure if they can't be paused by user preference.
**Interview signal:** Knowing WCAG 2.1 SC 2.3.3 (Animation from Interactions) — signals accessibility experience beyond ARIA roles.

### Pause on focus (not just hover)
**What we did:** `onFocusIn` pauses auto-play; `onFocusOut` resumes it (if the focus leaves the carousel entirely).
**Why it matters:** Keyboard users navigate with Tab — if auto-play changes the slide while they're focused on a dot indicator or CTA, the focus jumps unexpectedly.
**Interview signal:** Thinking about focus management in interactive carousels.

### `aria-live="polite"` for slide announcements
**What we did:** A visually hidden (`sr-only`) `aria-live` region updates with the current slide content description on each transition.
**Why it matters:** Screen reader users can't see the slides change. Without a live region, they get no feedback that the carousel advanced.
**Interview signal:** Understanding that ARIA live regions are the mechanism for announcing non-interactive content changes to AT.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Slide animation | `opacity` fade or `left` positioning | CSS `translateX` — GPU composited, no layout reflow |
| Auto-play cleanup | `setInterval` with no `clearInterval` | Cleanup in `useEffect` return |
| Pause trigger | `mouseenter` only | `mouseenter` + `focusin` + `prefers-reduced-motion` |
| Swipe | Not implemented | Pointer events with 50px threshold |
| ARIA | Not present | `aria-live`, dot `aria-label`, Prev/Next `aria-label` |
| Infinite loop | Manual wrapping logic | `(i + 1) % total` — modulo wraps cleanly |

---

## Common Pitfalls to Avoid

- **`setInterval` without `clearInterval`:** Memory leak + the carousel continues running after unmount.
- **Pausing only on `mouseenter`:** Keyboard users focus inside the carousel too — use `focusin/focusout` as well.
- **Touch events instead of pointer events:** Pointer events unify mouse, touch, and stylus — touch events require separate mouse event handlers on desktop.
- **Not updating `aria-live` on slide change:** Screen readers get no feedback without this.

---

## Key Takeaways

- CSS `transform: translateX()` is always the right animation approach for carousels — never `left` or `margin`.
- Auto-play: `setInterval` + `clearInterval` cleanup + pause on hover AND focus.
- Respect `prefers-reduced-motion` — disable auto-play and set `transition: none`.
- `aria-live="polite"` announces slide changes to screen readers without interrupting current speech.
- Swipe via pointer events (not touch) handles mouse drag and touch with one handler.
