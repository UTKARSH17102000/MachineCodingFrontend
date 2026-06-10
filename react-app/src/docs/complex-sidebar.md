# Complex Sidebar — Interview Guide

> **Category:** Navigation · **Difficulty:** Hard

---

## What This Question Tests

Complex Sidebar tests navigation UX patterns — multi-level expand/collapse, overlay mode on mobile, focus trap inside the overlay, and Escape key to close. The focus trap is the hardest and most important signal: when the overlay sidebar is open, Tab must cycle only within the sidebar. This is a WCAG requirement for modal-like overlays.

---

## Starting Point (First 2 Minutes)

1. **Two modes:** "Desktop: sidebar is a fixed side panel — no overlay, always visible. Mobile: sidebar is an off-canvas overlay with a backdrop."
2. **Expand state:** "Multi-level: `expandedIds: Set<string>` at root. Clicking a nav item with children toggles its expand state."
3. **Focus trap:** "When the overlay is open, I'll implement a focus trap — Tab cycles only within the sidebar, never reaching the main content behind the backdrop."
4. **Escape key:** "`document.keydown` listener while the overlay is open — Escape closes and returns focus to the trigger button."

---

## What the Interviewer is Looking For

- Multi-level nav with `expandedIds: Set` at root.
- **Overlay mode** (mobile) with backdrop (`position: fixed`, `inset: 0`).
- **Focus trap** inside the overlay — Tab and Shift+Tab wrap within focusable sidebar elements.
- **Escape key** closes the overlay and restores focus to the trigger.
- `aria-expanded` on parent nav items.
- `aria-hidden="true"` on the main content while overlay is open.
- Smooth CSS `translate(-100%, 0) → translate(0, 0)` animation — not `left`.

---

## Recommended Approach

### Step 1 — State
```jsx
const [isOpen, setIsOpen]       = useState(false); // overlay open (mobile)
const [expandedIds, setExpandedIds] = useState(new Set());
const triggerRef = useRef(null); // button that opened the overlay
const sidebarRef = useRef(null); // sidebar container for focus trap
```

### Step 2 — Focus trap
```jsx
function trapFocus(e) {
  const focusable = sidebarRef.current.querySelectorAll(
    'a[href], button:not([disabled]), input, [tabindex="0"]'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  if (e.key === 'Escape') { closeOverlay(); }
}

useEffect(() => {
  if (!isOpen) return;
  document.addEventListener('keydown', trapFocus);
  sidebarRef.current.querySelector('a, button')?.focus(); // move focus into sidebar
  return () => document.removeEventListener('keydown', trapFocus);
}, [isOpen]);
```

### Step 3 — Close overlay and restore focus
```jsx
function closeOverlay() {
  setIsOpen(false);
  triggerRef.current?.focus(); // restore focus to the trigger button
}
```

### Step 4 — CSS slide animation
```css
.sidebar {
  transform: translateX(-100%);
  transition: transform 300ms ease;
}
.sidebar.open {
  transform: translateX(0);
}
```

---

## Optimizations Implemented

### Focus trap — cycles Tab within the sidebar
**What we did:** A `keydown` listener on `document` intercepts Tab and Shift+Tab, wrapping focus between the first and last focusable elements within `sidebarRef.current`.
**Why it matters:** Without a focus trap, Tab from the last sidebar link reaches the main content behind the overlay — keyboard users lose context and end up interacting with hidden content.
**Interview signal:** Focus trapping is a WCAG 2.1 AA requirement for any modal-like overlay. Implementing it correctly (including Shift+Tab) is a strong lead signal.

### Focus restoration on close
**What we did:** `triggerRef.current?.focus()` after `closeOverlay()` restores focus to the hamburger button that opened the sidebar.
**Why it matters:** WCAG 2.4.3 requires that when a dialog closes, focus returns to the element that triggered it. Without this, keyboard users lose their position in the page.
**Interview signal:** Treating focus management as a state-machine concern, not an afterthought.

### CSS `translateX` for slide animation
**What we did:** `transform: translateX(-100%)` when closed, `translateX(0)` when open — CSS transition handles the animation.
**Why it matters:** Using `left: -300px` triggers layout reflow on every frame. `transform` is GPU-composited — smooth even on low-end mobile.
**Interview signal:** Distinguishing layout-triggering properties (`left`, `width`) from composite-only properties (`transform`, `opacity`).

### `aria-hidden="true"` on main content during overlay
**What we did:** When the overlay is open, `aria-hidden="true"` is applied to the main content element.
**Why it matters:** Screen reader users navigating the page might "see" main content even while the overlay is open, since the DOM is not hidden. `aria-hidden` hides the content from AT while the overlay is active.
**Interview signal:** Knowing that focus trap + `aria-hidden` together achieve proper modal isolation for AT users.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Overlay close | `×` button only | Backdrop click + Escape key + `×` button |
| Focus trap | Not implemented | Tab wraps within sidebar; Shift+Tab wraps backward |
| Focus restoration | Not considered | `triggerRef.current.focus()` on close |
| Animation | `display: none/block` | CSS `translateX` transition |
| ARIA | `aria-expanded` on toggle | Full: `aria-expanded`, `aria-hidden` on main, `aria-label` on sidebar |
| Backdrop | Styled `div` that does nothing | Backdrop click closes overlay |

---

## Common Pitfalls to Avoid

- **No focus trap:** Tab leaves the sidebar and reaches behind-the-overlay content — a WCAG failure.
- **`left: -300px` animation:** Triggers layout reflow — use `transform: translateX(-100%)`.
- **Not restoring focus on close:** Keyboard users lose their place in the page.
- **`aria-hidden` without focus trap (or vice versa):** Both are needed together — `aria-hidden` hides from AT, focus trap keeps DOM focus inside.

---

## Key Takeaways

- Focus trap is the hardest and most important requirement — Tab must never escape the overlay.
- Focus restoration: always `triggerRef.current.focus()` when the overlay closes.
- CSS `translateX` for the slide animation — never `left` or `margin-left`.
- `aria-hidden="true"` on main content while overlay is open — required for AT.
- Escape key closes overlay: `document.keydown` listener attached only while open, removed in cleanup.
