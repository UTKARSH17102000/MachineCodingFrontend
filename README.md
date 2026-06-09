# Machine Coding Frontend

A monorepo of 20 Lead Frontend Engineer machine coding questions, each implemented twice — once in **React** (Vite 6 + React 19) and once in **Vanilla JS** (zero dependencies).

## Structure

```
MachineCodingFrontend/
├── react-app/       # Vite + React 19 + React Router v7
└── vanilla-app/     # Plain HTML / CSS / JS, no build step
```

## Questions

| # | Question | Category | Difficulty |
|---|---|---|---|
| 1 | Pagination | Data Display | Easy |
| 2 | Dark Mode | Global Feature | Easy |
| 3 | Reusable Toast | UI Component | Medium |
| 4 | Accordion | UI Component | Easy |
| 5 | Tabs Component | UI Component | Easy |
| 6 | OTP Input | Form Control | Medium |
| 7 | Progress Bar | UI Component | Easy |
| 8 | Parallel Progress Bar | UI Component | Medium |
| 9 | Price Range Slider | Form Control | Medium |
| 10 | Multiselect Dropdown | Form Control | Medium |
| 11 | Searchable Dropdown | Form Control | Medium |
| 12 | Carousel | UI Component | Medium |
| 13 | Infinite Scroll | Data Display | Medium |
| 14 | All Pagination Types | Data Display | Medium |
| 15 | Tic Tac Toe | Game | Easy |
| 16 | Nested File System | Recursive UI | Hard |
| 17 | Nested Comments | Recursive UI | Medium |
| 18 | Tree Navigation + Checkbox | Recursive UI | Hard |
| 19 | Complex Sidebar | Navigation | Hard |
| 20 | Jira Board (Drag & Drop) | Interaction | Hard |

## Getting Started

### React App

```bash
cd react-app
npm install
npm run dev
# → http://localhost:5173
```

### Vanilla App

```bash
cd vanilla-app
npm install
npm run dev
# → http://localhost:5174
```

Each vanilla question is a standalone HTML page — no bundler required. Open any `index.html` directly in a browser or use the hub dashboard.

## Standards

Every question implements:

- **Accessibility** — semantic HTML, ARIA roles/attributes, screen-reader announcements
- **Keyboard navigation** — Tab, Arrow keys, Enter/Space, Escape, Home/End
- **Dark mode** — CSS custom property token system, `[data-theme]` attribute switching
- **No magic numbers** — all colors and spacing via CSS custom properties

### React patterns
- Logic in custom hooks, presentation in components
- CSS Modules for scoped styles
- `useReducer` for complex state (Toast queue, Kanban board)
- `createPortal` for overlays (Toast)
- `IntersectionObserver` for Infinite Scroll
- `requestAnimationFrame` for animation loops (Progress Bars)
- HTML5 native Drag & Drop API (Jira Board)

### Vanilla JS patterns
- `'use strict'` + Data → Logic → Render → Boot section structure
- Shared CSS design tokens via `@import url('../style.css')`
- `IntersectionObserver` sentinel pattern (Infinite Scroll)
- `getComputedStyle` for visibility checks (focus traps on `position: fixed` elements)
- `void el.offsetHeight` forced reflow for CSS height transition animations
