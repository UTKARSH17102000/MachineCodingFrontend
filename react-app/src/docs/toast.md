# Reusable Toast — Interview Guide

> **Category:** UI Component · **Difficulty:** Medium

---

## What This Question Tests

Toast tests your ability to design a singleton notification system — a global manager that any component can call without prop drilling. It evaluates: queue management (multiple toasts), auto-dismiss with accurate cleanup, portal rendering to escape z-index stacking contexts, and a clean imperative API (`toast.success(msg)`) vs. a pure React declarative approach.

---

## Starting Point (First 2 Minutes)

1. **API first:** Decide the consumer interface upfront. `toast.success('Saved!')` (imperative, easiest to call) vs. dispatching to a context (more React-idiomatic). Name this trade-off.
2. **State location:** A central store (context or module-level singleton) manages the list of active toasts. Each toast has `id`, `type`, `message`, `duration`.
3. **Portal:** Toasts live outside the normal React tree in a `document.body`-level portal so they can't be clipped by `overflow: hidden` or `z-index` stacking contexts.
4. **Cleanup:** Every `setTimeout` for auto-dismiss must be cancelled in cleanup — especially important when the component unmounts early.

---

## What the Interviewer is Looking For

- **Unique IDs** for each toast — `crypto.randomUUID()` or `Date.now()`.
- **Auto-dismiss** via `setTimeout` with proper `clearTimeout` cleanup.
- **Multiple toasts** — new toast appends, old ones dismiss independently.
- **Manual close** — `×` button dismisses immediately.
- **Portal rendering** — `ReactDOM.createPortal` to `document.body`.
- **Position variants** — at minimum top-right and bottom-center.
- **4 types** — `success`, `error`, `warning`, `info` with distinct colours.

---

## Recommended Approach

### Step 1 — Define the toast data shape
```js
{ id: string, type: 'success'|'error'|'warning'|'info', message: string, duration: number }
```

### Step 2 — Central toast store via context
```jsx
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const add = useCallback((toast) => dispatch({ type: 'ADD', toast: { ...toast, id: crypto.randomUUID() } }), []);
  const remove = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);
  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      {createPortal(<ToastList toasts={toasts} onRemove={remove} />, document.body)}
    </ToastContext.Provider>
  );
}
```

### Step 3 — Auto-dismiss in ToastItem
```jsx
useEffect(() => {
  const id = setTimeout(onRemove, duration);
  return () => clearTimeout(id);  // cleanup if toast unmounts before timer fires
}, [duration, onRemove]);
```

### Step 4 — Expose a `useToast()` hook
```js
export const useToast = () => useContext(ToastContext);
```

---

## Optimizations Implemented

### Portal rendering to `document.body`
**What we did:** `ReactDOM.createPortal(<ToastList />, document.body)` renders the toast container outside the React component tree's DOM hierarchy.
**Why it matters:** Any ancestor with `overflow: hidden`, `transform`, or a low `z-index` would clip or cover toasts rendered in the normal flow.
**Interview signal:** Knowing that `position: fixed` elements are still constrained by ancestor `transform` — a common production bug.

### `useReducer` for toast queue mutations
**What we did:** ADD and REMOVE are handled by a reducer instead of `useState` with spread.
**Why it matters:** The reducer is a pure function — easy to test in isolation. Multiple concurrent dispatches are batched correctly.
**Interview signal:** Choosing `useReducer` for "one state, multiple mutation types" is a lead-level pattern.

### `useCallback` on `add` and `remove`
**What we did:** Both functions are wrapped in `useCallback` with stable deps so they don't cause context consumers to re-render on every ToastProvider render.
**Interview signal:** Understanding that context value identity triggers re-renders in consumers — a common performance pitfall.

### Progress bar driven by CSS animation
**What we did:** The dismiss progress bar is a CSS `@keyframes scaleX(1 → 0)` animation matching the duration — no JavaScript interval.
**Why it matters:** JS-based progress (`setInterval` + state update) causes re-renders at 60fps. CSS animation is GPU-composited.
**Interview signal:** Preferring CSS for visual-only effects; reserving JS state for semantic state changes.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| State location | Lifted to a shared ancestor, or prop-drilled | Context + portal — any component calls it |
| Toast ID | Array index | `crypto.randomUUID()` — stable even after removals |
| Auto-dismiss | `setTimeout` with no cleanup | `useEffect` returning `clearTimeout` |
| Stacking order | `z-index: 9999` on a non-portal element | `createPortal` to `document.body` |
| Multiple toasts | Replaces previous toast | Queue — toasts append, each has its own timer |
| Progress bar | Not implemented | CSS `@keyframes` animation — no JS interval |
| Accessibility | Not considered | `role="alert"` or `aria-live="polite"` on container |

---

## Common Pitfalls to Avoid

- **Not cleaning up `setTimeout`:** If a component unmounts before the timer fires (e.g., page navigation), the callback runs on a dead reference.
- **Using array index as key:** Removing a middle toast scrambles React's reconciliation.
- **Not using a portal:** Toasts can be hidden behind modals or clipped by `overflow: hidden` ancestors.
- **Prop-drilling `showToast`:** Every component that might show a toast would need the function passed down — that's a sign the state is in the wrong place.

---

## Key Takeaways

- Design the consumer API first: `const { add } = useToast()` is the ideal interface — zero boilerplate at call sites.
- Portal rendering is mandatory in production — `createPortal(, document.body)` solves z-index and overflow problems at once.
- `clearTimeout` in the `useEffect` cleanup is non-negotiable — it's one of the most common memory/bug sources in timer-based UIs.
- `useReducer` shines here: ADD, REMOVE, and optionally PAUSE are clean actions on a list.
- CSS progress animation is smoother than JS — use CSS for visual timers, JS only for semantic state.
