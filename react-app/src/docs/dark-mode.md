# Dark Mode — Interview Guide

> **Category:** Global Feature · **Difficulty:** Easy

---

## What This Question Tests

Dark mode evaluates whether you can design a global, persistent UI feature cleanly — without prop-drilling the theme everywhere. It tests your knowledge of CSS custom properties (the right way to theme), `localStorage` for persistence, and the `prefers-color-scheme` media query for respecting OS settings. A lead engineer treats this as a system-design problem at small scale.

---

## Starting Point (First 2 Minutes)

1. **Define scope:** "I'll use a `data-theme` attribute on `<html>` with CSS variables — no class toggling, no inline styles."
2. **State surface:** One boolean (`isDark`) in a React context or top-level state. No prop drilling.
3. **Initialization order:** "On first visit I'll read `prefers-color-scheme`; on subsequent visits I'll restore from `localStorage`. The OS preference wins only if the user hasn't made an explicit choice."
4. **Flash prevention:** Mention the FOUC problem — the flash of wrong theme before JS runs. (Even if you don't solve it in a 45-minute round, naming it is a lead signal.)

---

## What the Interviewer is Looking For

- **CSS variables** for theming, not class swapping or inline styles.
- **`prefers-color-scheme`** detection for the first visit.
- **`localStorage`** persistence so the choice survives page reload.
- **Context or lifted state** — theme applied at the root, not passed as props.
- **Clean toggle API** (`useTheme()` hook or similar) so any component can read/set the theme.

---

## Recommended Approach

### Step 1 — CSS variables in two rulesets
```css
:root { --color-bg: #0f1117; --color-text: #e8e8f0; }
[data-theme="light"] { --color-bg: #f8f9fc; --color-text: #1a1a2e; }
```

### Step 2 — Initialize theme with preference cascade
```js
function getInitialTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
```

### Step 3 — Apply to DOM root and persist
```js
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
```

### Step 4 — Expose via context/hook
Wrap in a `ThemeContext` with a `useTheme()` hook. The toggle button imports the hook — no prop drilling.

---

## Optimizations Implemented

### CSS custom properties — zero re-render theme switching
**What we did:** All colours are defined as CSS variables on `:root` and `[data-theme="light"]`. A single DOM attribute change (`document.documentElement.setAttribute`) triggers a CSS cascade update — no React re-render of the whole tree.
**Why it matters:** Class-based or inline-style theming requires React state updates that propagate re-renders throughout the component tree.
**Interview signal:** Understanding that CSS is the runtime for styling — React doesn't need to know about every colour.

### `prefers-color-scheme` detection on first visit
**What we did:** `window.matchMedia('(prefers-color-scheme: dark)').matches` is checked only when no saved preference exists.
**Why it matters:** Users with OS-level dark mode preferences get the right theme immediately without manual configuration.
**Interview signal:** Awareness of the `matchMedia` API and the respectful UX pattern of "system default → explicit override".

### `localStorage` key with forward-compatibility
**What we did:** Store `'light'` or `'dark'` as a string rather than a boolean, so adding a third theme (e.g. `'high-contrast'`) requires no migration.
**Interview signal:** Forward-thinking storage design — small detail that shows production experience.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Theming mechanism | Toggles a CSS class or inline styles | CSS custom properties on `data-theme` attribute |
| Initial theme | Always starts `dark` or `light` | Reads `localStorage` first, then `prefers-color-scheme` |
| State propagation | Prop-drills `isDark` through components | Context + `useTheme()` hook |
| Persistence | May forget `localStorage` | Saves on every toggle, restores on mount |
| Flash of wrong theme | Not considered | Names the FOUC problem; may add inline script to `<head>` |
| Transition | Hard swap | `transition: background-color 200ms, color 200ms` on `:root` |

---

## Common Pitfalls to Avoid

- **Storing the colour values in React state:** The theme switch should not cause React to re-render the whole app — that's the CSS variable's job.
- **Using a CSS class instead of a data attribute:** Both work, but `data-theme` is semantically cleaner and avoids `.dark .dark-overrides .dark-button` specificity chains.
- **Initializing in `useEffect`:** This causes a flash — `getInitialTheme()` should run synchronously before the first render (or in an inline script in `<head>` for SSR).
- **Ignoring `prefers-color-scheme`:** Users who haven't interacted with the toggle yet deserve their OS preference respected.

---

## Key Takeaways

- CSS custom properties make theming zero-cost at runtime — React state updates are unnecessary for color changes.
- Three-level initialization cascade: `localStorage` → `prefers-color-scheme` → default.
- Context + custom hook is the clean API: `const { theme, toggle } = useTheme()`.
- FOUC (flash of unstyled content) is the hard part — mentioning it signals production experience even in a 45-minute round.
- Smooth CSS transition between themes (`transition: background-color 200ms`) is a one-liner that transforms the UX.
