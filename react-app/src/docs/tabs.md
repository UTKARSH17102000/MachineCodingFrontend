# Tabs Component — Interview Guide

> **Category:** UI Component · **Difficulty:** Easy

---

## What This Question Tests

Tabs is the canonical ARIA pattern test. Interviewers want to see correct `role="tablist"`, `role="tab"`, `role="tabpanel"` structure, `aria-selected`, and — most critically — **roving tabindex**. The roving tabindex pattern means only the active tab is in the tab order (`tabIndex=0`), all others are removed (`tabIndex=-1`), and arrow keys move focus between tabs. This is the signal that separates lead engineers from juniors.

---

## Starting Point (First 2 Minutes)

1. **Name the ARIA pattern:** "I'll implement the ARIA Tabs pattern — `role='tablist'` wrapping `role='tab'` buttons, each controlling a `role='tabpanel'`."
2. **State model:** Single `activeId` string. Panel content is derived by matching `tab.id === activeId`.
3. **Roving tabindex:** "Only the active tab gets `tabIndex=0`; all others get `tabIndex=-1`. Arrow keys move focus — Tab key exits the tablist entirely."
4. **Data shape:** `[{ id, label, content }]` — generic, prop-driven.

---

## What the Interviewer is Looking For

- `role="tablist"`, `role="tab"`, `role="tabpanel"` on the correct elements.
- `aria-selected={isActive}` on each tab.
- `aria-controls` pointing to the panel `id`.
- **Roving tabindex** — active tab `tabIndex=0`, rest `tabIndex=-1`.
- **Arrow key navigation** — Left/Right moves focus and optionally activates.
- **Home/End** keys — jump to first/last tab.
- Panels not shown have `hidden` attribute or are unmounted.

---

## Recommended Approach

### Step 1 — State
```jsx
const [activeId, setActiveId] = useState(tabs[0].id);
```

### Step 2 — Tab buttons with ARIA + roving tabindex
```jsx
<div role="tablist" aria-label="Question sections">
  {tabs.map((tab, i) => (
    <button
      key={tab.id}
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={activeId === tab.id}
      aria-controls={`panel-${tab.id}`}
      tabIndex={activeId === tab.id ? 0 : -1}
      onClick={() => setActiveId(tab.id)}
      onKeyDown={(e) => handleKeyDown(e, i)}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Step 3 — Arrow key handler
```jsx
function handleKeyDown(e, index) {
  const last = tabs.length - 1;
  const map = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft:  index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  };
  if (map[e.key] !== undefined) {
    e.preventDefault();
    const next = tabs[map[e.key]];
    setActiveId(next.id);
    tabRefs.current[map[e.key]]?.focus();
  }
}
```

### Step 4 — Panels with `hidden`
```jsx
{tabs.map((tab) => (
  <div
    key={tab.id}
    role="tabpanel"
    id={`panel-${tab.id}`}
    aria-labelledby={`tab-${tab.id}`}
    hidden={activeId !== tab.id}
  >
    {tab.content}
  </div>
))}
```

---

## Optimizations Implemented

### Roving tabindex (not `tabIndex=0` on all tabs)
**What we did:** Active tab has `tabIndex=0`; all inactive tabs have `tabIndex=-1`.
**Why it matters:** If all tabs had `tabIndex=0`, keyboard users would Tab through every single tab before reaching the panel content — terrible UX for large tab bars. Roving tabindex means one Tab stop for the whole tablist.
**Interview signal:** Knowing the ARIA Tabs Pattern by heart — this is the most common accessibility failure in tab implementations.

### `useRef` array for focus management
**What we did:** A `tabRefs = useRef([])` array stores a ref for each tab button. After `setActiveId`, we call `tabRefs.current[newIndex].focus()`.
**Why it matters:** React state updates are asynchronous — you can't call `document.getElementById(...).focus()` in the same event handler synchronously and expect the DOM to have the new `tabIndex=0` yet. The ref array gives direct imperative access.
**Interview signal:** Understanding the React render cycle and why imperative focus management requires refs.

### `hidden` attribute on inactive panels (not `display: none`)
**What we did:** Inactive panels use the HTML `hidden` attribute.
**Why it matters:** `hidden` removes the element from the accessibility tree and the tab order — screen readers won't stumble into invisible content. `display: none` via CSS does the same visually, but `hidden` communicates intent semantically in the HTML.
**Interview signal:** Knowing the semantic difference between CSS visibility and HTML `hidden`.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Tab order | All tabs `tabIndex=0` — Tab visits every tab | Roving tabindex — one Tab stop, arrows navigate |
| ARIA | `className="active"` only | `role`, `aria-selected`, `aria-controls`, `aria-labelledby` |
| Keyboard | `onClick` only | Arrow Left/Right, Home/End implemented |
| Panel hiding | CSS `display: none` | `hidden` attribute on inactive panels |
| Focus after activation | Not managed | `tabRefs.current[i].focus()` on keyboard nav |
| Data | Hardcoded tab JSX | Driven by `tabs` prop array |

---

## Common Pitfalls to Avoid

- **`tabIndex=0` on all tabs:** This breaks keyboard navigation — users Tab through every tab before reaching content.
- **Forgetting `aria-selected`:** Screen readers announce tabs as just "button" without this attribute.
- **`display: none` on all inactive panels but keeping them in the DOM accessible:** They should be `hidden` or unmounted.
- **Not implementing arrow keys:** The ARIA spec requires it; interviewers notice its absence.

---

## Key Takeaways

- Roving tabindex is the single most important concept — mention it in the first 30 seconds.
- The ARIA Tabs pattern: `tablist > tab[aria-selected, aria-controls] + tabpanel[aria-labelledby]`.
- Arrow keys (Left/Right) activate tabs + manage focus; Tab exits the tablist.
- Use a `useRef` array for imperative focus — don't try to call `.focus()` on an element that might not have `tabIndex=0` yet.
- Home/End keys (jump to first/last) earn bonus points without much extra code.
