# Tic Tac Toe — Interview Guide

> **Category:** Game · **Difficulty:** Easy

---

## What This Question Tests

Tic Tac Toe is a state machine and derived-state test. The interviewer wants to see immutable state updates (never `board[i] = val`), a clean win detection function, and — for a lead signal — time-travel using move history. The key design insight is that `winner` and `isGameOver` are derived from the board, not stored in separate state variables.

---

## Starting Point (First 2 Minutes)

1. **Immutable state updates:** "I'll represent the board as a flat `string[9]` where each element is `'X'`, `'O'`, or `''`. Updates create a new array — `[...board]` — never mutate in place."
2. **Derived winner:** "I'll compute the winner by checking the 8 winning lines on every render — no extra `useState` for the winner."
3. **Move history (lead signal):** "I'll store a `history: string[][]` — each entry is a board snapshot. Time-travel is just `setCurrentMove(n)` which changes the displayed board."
4. **Turn tracking:** "With move history, the current player is derived: `currentMove % 2 === 0 ? 'X' : 'O'` — not a separate state variable."

---

## What the Interviewer is Looking For

- **Immutable board updates** — new array on every move.
- **Derived winner** — computed from board state, not stored.
- **Time-travel** via move history (`history[move]`) — optional but strongly recommended.
- **Draw detection** — `board.every(cell => cell !== '')` && no winner.
- **ARIA grid** — `role="grid"`, `role="row"`, `role="gridcell"`.
- Restart button that resets all state to initial.

---

## Recommended Approach

### Step 1 — State with history
```jsx
const [history, setHistory] = useState([Array(9).fill('')]);
const [currentMove, setCurrentMove] = useState(0);
const board = history[currentMove];
const xIsNext = currentMove % 2 === 0;
```

### Step 2 — Win detection (8 lines, derived)
```js
const LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],          // diagonals
];
function calculateWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}
const winner = calculateWinner(board);
const isDraw = !winner && board.every(Boolean);
```

### Step 3 — Handle cell click
```jsx
function handleClick(i) {
  if (board[i] || winner) return; // cell taken or game over
  const nextBoard = [...board];
  nextBoard[i] = xIsNext ? 'X' : 'O';
  const nextHistory = history.slice(0, currentMove + 1); // discard future if time-traveled
  setHistory([...nextHistory, nextBoard]);
  setCurrentMove(nextHistory.length);
}
```

### Step 4 — Time-travel UI
```jsx
{history.map((_, move) => (
  <li key={move}>
    <button onClick={() => setCurrentMove(move)}>
      {move === 0 ? 'Go to game start' : `Go to move #${move}`}
    </button>
  </li>
))}
```

---

## Optimizations Implemented

### Derived state — winner and turn computed, not stored
**What we did:** `winner = calculateWinner(board)`, `isDraw = !winner && board.every(Boolean)`, `xIsNext = currentMove % 2 === 0` — all computed on each render.
**Why it matters:** Storing `winner` in `useState` creates a synchronisation problem: you'd need to update it on every board change, and if you forget once (e.g., after time-travel), the UI shows stale winner state.
**Interview signal:** Recognising that state that can be derived from other state should not be stored — a core React mental model.

### Immutable board — `[...board]` before mutation
**What we did:** Every cell click creates `const nextBoard = [...board]; nextBoard[i] = 'X'`.
**Why it matters:** Direct mutation (`board[i] = 'X'`) would mutate the current history entry in place — React might not detect the state change (shallow comparison), and the time-travel history entries would all reflect the latest state.
**Interview signal:** Understanding React's reliance on referential identity for change detection.

### Time-travel truncates "future" history
**What we did:** `history.slice(0, currentMove + 1)` discards moves after the current position when a new move is made from a past state.
**Why it matters:** Without truncation, the history can branch — a user travels to move 3, makes a move, and the old moves 4-7 are still in history. The displayed list becomes confusing.
**Interview signal:** This is an intentional design decision that shows systems thinking.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| State | `board[]` + `isXTurn` + `winner` all in state | `history[][]` + `currentMove` — everything else derived |
| Updates | `board[i] = val` (mutation) | `[...board]` — immutable copy |
| Winner detection | Checks all 8 lines with if-chains | `LINES` constant + `for...of` loop |
| Time-travel | Not implemented | Full `history[move]` time-travel |
| Draw detection | May miss or error | `board.every(Boolean) && !winner` |
| ARIA | `<div>` grid with no roles | `role="grid"`, `role="row"`, `role="gridcell"` |

---

## Common Pitfalls to Avoid

- **Mutating the board in state:** `board[i] = 'X'` modifies the existing array — React may not re-render, and time-travel history entries point to the same array reference.
- **Storing winner in state:** Creates a sync problem — it's always derivable from the board.
- **Not handling the "already clicked" guard:** Clicking a taken cell should do nothing — check `if (board[i])` before updating.
- **Not truncating future history on time-travel:** Leads to confusing move list when the user branches from a past state.

---

## Key Takeaways

- Immutable board updates are non-negotiable: `[...board]`, never `board[i] = val`.
- Winner and draw state are derived — computing them is cheap (8 lines, 9 cells).
- Move history (`string[][]`) + `currentMove` index gives time-travel for free — the current board is just `history[currentMove]`.
- Future truncation on time-travel branching: `history.slice(0, currentMove + 1)`.
- `xIsNext = currentMove % 2 === 0` — turn is derived from move count, not stored.
