# Form Builder — Interview Guide

> **Category:** Interaction · **Difficulty:** Hard

---

## What This Question Tests

Form Builder tests your ability to manage a dynamic schema (the list of configured fields) separately from the form data (what the user typed into those fields). The hardest part is preventing unnecessary re-renders in the preview form while the user types — which requires `useCallback` + `React.memo` and the schema/values separation. The interview also evaluates field type handling (text, number, checkbox, select, radio all have different controlled input patterns) and the `useReducer` pattern for field-level mutations.

---

## Starting Point (First 2 Minutes)

1. **Schema/values separation:** "I'll keep `fields[]` (what fields exist, how they're configured) separate from `formValues{}` (what the user typed). Deleting a field removes it from `fields` but doesn't corrupt sibling values in `formValues`."
2. **`useReducer` for fields:** "The field list has 4 mutations: ADD, REMOVE, MOVE_UP, MOVE_DOWN. This maps cleanly to `useReducer` — one dispatch with a clear action shape."
3. **`React.memo` for preview fields:** "Each `<FormField>` is memoized. The `onChange` handler is `useCallback` — stable ref means memoized children don't re-render when the builder panel re-renders."
4. **Field types to support:** `text`, `number`, `email`, `textarea`, `checkbox`, `select`, `radio` — all with different input patterns."

---

## What the Interviewer is Looking For

- **Schema/values separation** — `fields[]` and `formValues{}` are distinct state slices.
- **`useReducer` for fields** — ADD, REMOVE, MOVE_UP, MOVE_DOWN as actions.
- **`React.memo` + `useCallback`** — preview fields don't re-render when the config panel changes.
- **Field type variety** — at minimum: text, checkbox, select with options, radio group.
- **`fieldset + legend`** for radio groups (correct semantic HTML).
- **Submit** — logs `{ [field.label]: value, ... }` as an object.
- **Validation** — label required; options required for select/radio.

---

## Recommended Approach

### Step 1 — State architecture
```jsx
const [fields, dispatch]          = useReducer(fieldsReducer, []);
const [formValues, setFormValues] = useState({});
const [draft, setDraft]           = useState(INITIAL_DRAFT); // config panel
```

### Step 2 — Fields reducer
```js
function fieldsReducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [...state, action.field];
    case 'REMOVE': return state.filter((f) => f.id !== action.id);
    case 'MOVE_UP': {
      const i = state.findIndex((f) => f.id === action.id);
      if (i <= 0) return state;
      const next = [...state]; [next[i-1], next[i]] = [next[i], next[i-1]]; return next;
    }
    case 'MOVE_DOWN': {
      const i = state.findIndex((f) => f.id === action.id);
      if (i >= state.length - 1) return state;
      const next = [...state]; [next[i], next[i+1]] = [next[i+1], next[i]]; return next;
    }
    default: return state;
  }
}
```

### Step 3 — Stable `updateValue` for memo
```jsx
const updateValue = useCallback((id, value) => {
  setFormValues((prev) => ({ ...prev, [id]: value }));
}, []); // stable ref — never recreated
```

### Step 4 — Memoized FormField
```jsx
const FormField = memo(function FormField({ field, value, onChange }) {
  // Renders the correct input type based on field.type
  // Only re-renders if field, value, or onChange change
});
```

### Step 5 — Submit handler
```jsx
function handleSubmit(e) {
  e.preventDefault();
  const result = {};
  fields.forEach((f) => { result[f.label || f.id] = formValues[f.id] ?? defaultValue(f.type); });
  console.log('Form values:', result);
}
```

---

## Optimizations Implemented

### Schema/values separation — delete field without corrupting data
**What we did:** `fields[]` defines the schema (shape of the form). `formValues{}` stores user input keyed by field id. When a field is removed, its key is deleted from `formValues`, but sibling field values are untouched.
**Why it matters:** If form values were nested inside field objects (`field.value`), removing a field mid-array shifts other fields' data. With a separate `formValues` map, deletion is surgical: `delete formValues[removedId]`.
**Interview signal:** Separating "data schema" from "data values" is a foundational database/state design principle.

### `useReducer` for field mutations — grouped, testable
**What we did:** ADD, REMOVE, MOVE_UP, MOVE_DOWN are dispatched to `fieldsReducer`.
**Why it matters:** 4 `useState` setters for the same state object creates scattered, hard-to-test mutation logic. `useReducer` centralises it — the reducer is a pure function, testable with `fieldsReducer(state, { type: 'REMOVE', id })`.
**Interview signal:** Reaching for `useReducer` when state has 3+ distinct mutations is a lead-level signal.

### `useCallback` + `React.memo` — preview doesn't re-render during config typing
**What we did:** `updateValue` is wrapped in `useCallback([])` — never recreated. `FormField` is wrapped in `React.memo` — skips re-render when `field`, `value`, and `onChange` haven't changed.
**Why it matters:** The builder panel has text inputs — typing in the label field causes the parent to re-render. Without memoisation, all preview fields re-render on every keystroke — losing focus/cursor position in native inputs.
**Interview signal:** Understanding the `useCallback` + `memo` chain: stable callback reference → memoized child skips render. Both are required; one alone doesn't work.

### `fieldset + legend` for radio groups
**What we did:** Radio groups use `<fieldset><legend>{label}</legend>` + `<input type="radio">` per option.
**Why it matters:** Screen readers announce the `<legend>` for every radio button in the group — giving users the question context for each option. A `<div>` label above a group doesn't have this semantic linking.
**Interview signal:** Knowing the correct semantic HTML for radio groups — not a ARIA hack, but the native HTML solution.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Schema/values | `field.value` embedded in field object | Separate `fields[]` and `formValues{}` |
| Field mutations | `useState` + multiple setters | `useReducer` with ADD/REMOVE/MOVE_UP/MOVE_DOWN |
| Preview re-renders | Every config keystroke re-renders all fields | `useCallback` + `React.memo` — only changed fields re-render |
| Field types | Text only, or basic types | All 7: text, number, email, textarea, checkbox, select, radio |
| Radio groups | `<div>` with label on top | `<fieldset>` + `<legend>` — correct semantic HTML |
| Validation | Not present | Label required; options required for select/radio |

---

## Common Pitfalls to Avoid

- **Embedding `value` inside field objects:** Makes field deletion corrupting (adjacent values shift) and prevents schema-only operations.
- **`useState` for field list:** With 4 mutation types, this leads to complex inline setters. `useReducer` is cleaner.
- **Not memoizing preview fields:** Config panel inputs re-render all preview fields on every keystroke — cursor position is lost in text inputs.
- **`<div role="radiogroup">` instead of `<fieldset>`:** The ARIA approach requires more attributes and is more error-prone. Native HTML `<fieldset>` is the correct, minimal solution.

---

## Key Takeaways

- Schema/values separation is the architectural core: `fields[]` defines shape, `formValues{}` holds data. Never merge them.
- `useReducer` for ADD/REMOVE/MOVE_UP/MOVE_DOWN — 4 mutations, one centralised reducer.
- `useCallback` + `React.memo` chain: stable `onChange` ref → memoized `<FormField>` skips config-keystroke re-renders.
- `<fieldset><legend>` for radio groups — not a `div` with a label. Native HTML > ARIA workarounds.
- Submit: keys the result by `field.label` (human-readable), falls back to `field.id`.
