# OTP Input — Interview Guide

> **Category:** Form Control · **Difficulty:** Medium

---

## What This Question Tests

OTP Input is a focus-management and UX-polish test. The interviewer wants to see you handle auto-advance (type a digit, cursor jumps to next box), backspace behaviour (delete current digit or move back to previous), and paste handling (split pasted text across all boxes). These are the three non-obvious behaviours that separate a well-polished implementation from a naive one. Internally, the state model (array of 6 digits vs. a single string) is the first architectural decision.

---

## Starting Point (First 2 Minutes)

1. **State model decision:** "I'll store a `string[]` of length 6, one character per box. An alternative is a single string — I prefer the array because each input maps directly to `values[i]`, making reads/writes clean."
2. **Ref array for focus:** "I need a `useRef([])` array to call `.focus()` imperatively after each character entry or backspace."
3. **Three key interactions to cover:** auto-advance on input, backspace to go back, paste to fill all boxes.
4. **Don't over-think the validation:** OTP validation (matching a code) is out of scope unless asked — just build the input UI.

---

## What the Interviewer is Looking For

- `value[i]` controlled inputs — each box is a controlled `<input>` with exactly 1 character.
- **Auto-advance:** After typing a digit, focus moves to `inputs[i+1]`.
- **Backspace:** If the current box is empty, move focus to `inputs[i-1]`.
- **Paste:** Intercept the `paste` event, split the text, fill all boxes from the paste position.
- **Type restriction:** Only digits allowed — `inputMode="numeric"`, `pattern="[0-9]*"`, and an `input` guard.

---

## Recommended Approach

### Step 1 — State and refs
```jsx
const [values, setValues] = useState(Array(6).fill(''));
const inputRefs = useRef([]);
```

### Step 2 — Handle input (type + auto-advance)
```jsx
function handleChange(e, index) {
  const char = e.target.value.replace(/\D/g, '').slice(-1); // digits only, last typed
  const next = [...values];
  next[index] = char;
  setValues(next);
  if (char && index < 5) inputRefs.current[index + 1].focus();
}
```

### Step 3 — Handle backspace
```jsx
function handleKeyDown(e, index) {
  if (e.key === 'Backspace') {
    if (values[index]) {
      // Clear current box
      const next = [...values]; next[index] = ''; setValues(next);
    } else if (index > 0) {
      // Move to previous box
      inputRefs.current[index - 1].focus();
    }
  }
}
```

### Step 4 — Handle paste
```jsx
function handlePaste(e, index) {
  e.preventDefault();
  const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - index);
  const next = [...values];
  pasted.split('').forEach((char, i) => { next[index + i] = char; });
  setValues(next);
  const focusIndex = Math.min(index + pasted.length, 5);
  inputRefs.current[focusIndex].focus();
}
```

---

## Optimizations Implemented

### Single-character enforcement via `e.target.value.slice(-1)`
**What we did:** On `onChange`, we take only the last character of the input value (after stripping non-digits). This handles the case where a user types quickly and the browser inserts two characters.
**Why it matters:** Each box must hold exactly one digit. Simply using `e.target.value[0]` misses the "edit in place" case where there's already a digit and the user types over it.
**Interview signal:** Understanding that `onChange` fires after the DOM updates — `e.target.value` is the new full value, not just the typed character.

### Paste handler on individual inputs (not the wrapper)
**What we did:** Each `<input>` has its own `onPaste` handler. The handler reads the clipboard, fills boxes starting from the focused index, and advances focus to the last filled box.
**Why it matters:** A common mistake is attaching paste to the wrapper container — then you don't know which box had focus when paste happened.
**Interview signal:** Knowing that paste events fire on the focused element, not the container.

### `inputRefs.current` array for O(1) focus jumping
**What we did:** `ref={(el) => (inputRefs.current[i] = el)}` registers each input. Focus jumps are O(1) array lookups.
**Why it matters:** `document.querySelector('#otp-input-3')` is fragile and O(n) in the DOM. Direct ref access is stable and fast.
**Interview signal:** Preferring ref arrays over DOM queries for collections of sibling elements.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Focus management | `document.getElementById` queries | `useRef` array — direct, stable references |
| Auto-advance | Works for typing, breaks on backspace | Handles type, backspace (empty vs. non-empty), and paste |
| State model | Single string or one state var per box | `string[6]` array — clean index-based access |
| Paste | Not handled | `onPaste` intercept, split, fill, focus last filled |
| Type restriction | No restriction | `inputMode="numeric"`, `pattern="[0-9]*"`, `onKeyDown` guard |
| Initial focus | Not set | `autoFocus` on first box |

---

## Common Pitfalls to Avoid

- **Not handling the "non-empty backspace" case:** Backspace on an already-empty box should move focus back. Backspace on a filled box should clear it but not move focus.
- **Using `maxLength={1}` alone:** `maxLength` prevents typing more than 1 char, but it doesn't handle paste — you still need `onPaste`.
- **Not preventing default on paste:** Without `e.preventDefault()`, the browser will try to insert the full pasted text into the single input, which breaks the individual box model.
- **Allowing letters:** Always strip non-digits from input. Users on desktop may accidentally paste text.

---

## Key Takeaways

- Three interactions make this non-trivial: auto-advance, backspace (two cases), paste.
- `useRef` array for focus management — never query the DOM by ID in React.
- The backspace split: clear current digit first, then on a second backspace move backward.
- Paste intercept fills starting from the focused box — attach it to each `<input>`, not the wrapper.
- `inputMode="numeric"` triggers the numeric keyboard on mobile — a UX detail that signals mobile awareness.
