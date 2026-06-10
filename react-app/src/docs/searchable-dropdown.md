# Searchable Dropdown — Interview Guide

> **Category:** Form Control · **Difficulty:** Medium

---

## What This Question Tests

Searchable Dropdown (combobox) tests debounced input handling, keyboard navigation through a list, and the `aria-activedescendant` accessibility pattern. The `aria-activedescendant` pattern is the key lead signal — it lets the input element retain focus while visually "moving" to a highlighted option, which is exactly what screen readers expect for a combobox.

---

## Starting Point (First 2 Minutes)

1. **ARIA pattern name:** "This is the ARIA Combobox pattern — `role='combobox'` on the input, `role='listbox'` on the dropdown, `role='option'` on each item."
2. **State slices:** `query` (search string), `highlighted` (index of focused option), `selected` (the chosen option object), `isOpen` (boolean).
3. **Debounce:** "I'll debounce the filter by 200ms — no need to recompute the list on every keystroke."
4. **`aria-activedescendant`:** "The input has `aria-activedescendant` pointing to the `id` of the highlighted option — this is how screen readers track the selection without moving DOM focus."

---

## What the Interviewer is Looking For

- `role="combobox"` on the `<input>`, `aria-expanded`, `aria-haspopup`, `aria-autocomplete`.
- `role="listbox"` on the dropdown list.
- `role="option"` + `aria-selected` on each item.
- **`aria-activedescendant`** on the input pointing to the highlighted option's `id`.
- **Arrow key navigation** — Up/Down move the highlighted index, Enter selects, Escape closes.
- **Debounced filtering** — prevents excessive re-renders on rapid typing.
- Highlighted match text using `<mark>` or `<span>` for visual reinforcement.

---

## Recommended Approach

### Step 1 — State
```jsx
const [query, setQuery]           = useState('');
const [highlighted, setHighlighted] = useState(-1);
const [selected, setSelected]     = useState(null);
const [isOpen, setIsOpen]         = useState(false);
```

### Step 2 — Debounce hook
```js
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

### Step 3 — Filtered options
```jsx
const debouncedQuery = useDebounce(query, 200);
const filtered = useMemo(() =>
  options.filter((o) => o.label.toLowerCase().includes(debouncedQuery.toLowerCase())),
  [options, debouncedQuery]
);
```

### Step 4 — ARIA combobox markup
```jsx
<input
  role="combobox"
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  aria-autocomplete="list"
  aria-activedescendant={highlighted >= 0 ? `option-${filtered[highlighted]?.id}` : undefined}
  value={query}
  onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setHighlighted(-1); }}
  onKeyDown={handleKeyDown}
/>
<ul role="listbox" aria-label="Suggestions">
  {filtered.map((opt, i) => (
    <li
      key={opt.id}
      id={`option-${opt.id}`}
      role="option"
      aria-selected={selected?.id === opt.id}
      className={i === highlighted ? styles.highlighted : ''}
      onClick={() => selectOption(opt)}
      onMouseEnter={() => setHighlighted(i)}
    >
      {highlightMatch(opt.label, debouncedQuery)}
    </li>
  ))}
</ul>
```

### Step 5 — Keyboard handler
```jsx
function handleKeyDown(e) {
  const last = filtered.length - 1;
  if (e.key === 'ArrowDown') setHighlighted((h) => Math.min(h + 1, last));
  if (e.key === 'ArrowUp')   setHighlighted((h) => Math.max(h - 1, 0));
  if (e.key === 'Enter' && highlighted >= 0) selectOption(filtered[highlighted]);
  if (e.key === 'Escape') setIsOpen(false);
}
```

---

## Optimizations Implemented

### `aria-activedescendant` — focus stays on input, screen reader tracks list
**What we did:** The input's `aria-activedescendant` attribute is updated to point to the `id` of the highlighted `<li>` as the user arrows through the list.
**Why it matters:** Moving actual DOM focus to each `<li>` as the user navigates would blur the input and break the typing experience. `aria-activedescendant` is the ARIA mechanism that lets the input "announce" which option is virtually focused without moving focus.
**Interview signal:** Knowing the combobox ARIA pattern by name and implementation — not just `<select>` wrapped in a div.

### Debounced query with custom `useDebounce` hook
**What we did:** The filter computation waits 200ms after the last keystroke before updating the visible list.
**Why it matters:** Filtering 1000+ options on every keypress causes visible lag. Debouncing batches rapid typing into a single filter run.
**Interview signal:** Debouncing is a standard tool — naming the delay value choice (200ms for interactive, 300ms for API calls) shows production experience.

### Match highlighting with `<mark>`
**What we did:** The query substring in each option label is wrapped in `<mark>` — native semantic highlighting.
**Why it matters:** Visual match feedback helps users confirm their query matches the option. `<mark>` carries semantic meaning (highlighted text) vs. a plain `<span>` with a background colour.
**Interview signal:** Knowing the correct semantic element — `<mark>` for highlighted search matches.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| ARIA | `<div>` with custom class `selected` | Full combobox pattern: `role="combobox"`, `aria-activedescendant`, `role="listbox"`, `role="option"` |
| Search update | Filters on every character | `useDebounce` — filters after 200ms idle |
| Keyboard | Click-only | ArrowUp/Down, Enter to select, Escape to close |
| Match display | Plain text | `<mark>` wrapping the matched substring |
| Click-outside | Not handled | `document.mousedown` with `useRef` guard |
| Selection feedback | Replaces input with selected label | Updates `query` to label + stores full option object |

---

## Common Pitfalls to Avoid

- **Moving DOM focus to each list item:** This is the wrong ARIA pattern for a combobox. Use `aria-activedescendant` — the input keeps focus, the attribute tracks the "virtual" position.
- **Not debouncing:** Synchronous filtering of large lists on every keypress causes janky UX.
- **Forgetting `aria-expanded`:** Screen readers announce the combobox as open/closed based on this attribute.
- **Highlighting only on hover:** Keyboard users navigate without hovering — highlight state must be in JS (`highlighted` index), not CSS `:hover`.

---

## Key Takeaways

- `aria-activedescendant` is the ARIA combobox's core mechanism — input keeps focus, attribute tracks the highlighted option's `id`.
- Debounce query at 200ms — recomputing a filtered list on every keystroke is wasteful.
- Match highlighting with `<mark>` is the semantic, accessible choice.
- State: `query`, `highlighted`, `selected`, `isOpen` — four independent slices that don't entangle.
- Keyboard navigation (arrows + Enter + Escape) is required for WCAG 2.1 AA compliance.
