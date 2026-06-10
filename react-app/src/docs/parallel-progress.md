# Parallel Progress Bar — Interview Guide

> **Category:** UI Component · **Difficulty:** Medium

---

## What This Question Tests

Parallel Progress Bar is a `requestAnimationFrame` vs. `setInterval` trade-off question combined with independent timer management. It tests whether you can run multiple animations simultaneously without them interfering, and whether you know how to pause, resume, and reset individual animations cleanly. The key insight is that each bar needs its own animation loop (or shares one loop that dispatches per-bar updates).

---

## Starting Point (First 2 Minutes)

1. **`requestAnimationFrame` over `setInterval`:** "I'll use `requestAnimationFrame` because it syncs to the display refresh rate, is paused by the browser when the tab is hidden, and automatically cancels if you call `cancelAnimationFrame` on unmount."
2. **Per-bar state:** "Each bar has `progress` (0–100), `status` (`idle/running/paused/done`), and a `rafId` ref for cancellation."
3. **Independent loops:** "Each bar runs its own rAF loop — they don't share a single loop because pausing one shouldn't affect others."
4. **Cleanup:** "On component unmount, cancel all outstanding `rafId` refs."

---

## What the Interviewer is Looking For

- `requestAnimationFrame` — not `setInterval`.
- `cancelAnimationFrame` called in `useEffect` cleanup and on Reset.
- Per-bar `status` state (`idle`, `running`, `paused`, `done`).
- **Pause/resume** — store elapsed progress, resume from where it left off.
- **Reset** — cancel animation, reset progress to 0, status to `idle`.
- Multiple bars run simultaneously without interfering.

---

## Recommended Approach

### Step 1 — State shape per bar
```js
const initialBar = { progress: 0, status: 'idle' }; // 'idle'|'running'|'paused'|'done'
const [bars, setBars] = useState(Array(3).fill(null).map(() => ({ ...initialBar })));
const rafRefs = useRef([]); // one rAF ID per bar
const startTimes = useRef([]); // timestamp when current run started
const startProgress = useRef([]); // progress at the moment of resume
```

### Step 2 — Start/resume animation loop
```js
function startBar(index) {
  const DURATION = 3000; // ms to go 0→100
  startTimes.current[index] = performance.now();
  startProgress.current[index] = bars[index].progress;

  function tick(now) {
    const elapsed = now - startTimes.current[index];
    const added = (elapsed / DURATION) * 100;
    const newProg = Math.min(100, startProgress.current[index] + added);

    setBars((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], progress: newProg, status: newProg >= 100 ? 'done' : 'running' };
      return next;
    });

    if (newProg < 100) {
      rafRefs.current[index] = requestAnimationFrame(tick);
    }
  }
  rafRefs.current[index] = requestAnimationFrame(tick);
}
```

### Step 3 — Pause / Reset
```js
function pauseBar(index) {
  cancelAnimationFrame(rafRefs.current[index]);
  setBars((prev) => { const n=[...prev]; n[index]={...n[index], status:'paused'}; return n; });
}
function resetBar(index) {
  cancelAnimationFrame(rafRefs.current[index]);
  setBars((prev) => { const n=[...prev]; n[index]={progress:0, status:'idle'}; return n; });
}
```

### Step 4 — Cleanup on unmount
```js
useEffect(() => () => rafRefs.current.forEach((id) => cancelAnimationFrame(id)), []);
```

---

## Optimizations Implemented

### `requestAnimationFrame` — browser-synced, tab-aware
**What we did:** Each animation loop uses `requestAnimationFrame` instead of `setInterval(fn, 16)`.
**Why it matters:** rAF automatically pauses when the tab is hidden (battery/CPU savings), runs at the display's actual refresh rate (not a fixed 16ms that may drift), and is the browser's intended API for smooth animation.
**Interview signal:** Knowing the difference between rAF and setInterval for animation — a senior-level performance topic.

### Progress calculated from `performance.now()` delta, not a counter
**What we did:** `progress = startProgress + (elapsed / DURATION) * 100` where `elapsed = now - startTime`.
**Why it matters:** If each rAF tick adds a fixed `+0.5` to progress, fast machines with short frame times complete faster, slow machines complete slower. Timestamp-based math makes duration accurate regardless of frame rate.
**Interview signal:** Frame-rate-independent animation is a graphics programming fundamental.

### `cancelAnimationFrame` on unmount and reset
**What we did:** A `useEffect` cleanup cancels all outstanding rAF IDs. Reset also cancels before zeroing state.
**Why it matters:** Without cancellation, the rAF callback fires after the component unmounts, tries to call `setBars` on a dead component, and leaks state update cycles.
**Interview signal:** Treating async resources (rAF, setTimeout, subscriptions) as resources that must be released.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Animation | `setInterval` at 16ms | `requestAnimationFrame` |
| Duration accuracy | Adds fixed increment per tick | Timestamp delta / total duration |
| Pause/Resume | Difficult — interval restart from 0 | Cancel + store progress + resume from stored |
| Cleanup | Not implemented | `cancelAnimationFrame` in `useEffect` cleanup |
| Per-bar isolation | Shared timer or global state | Independent rAF loop per bar via `useRef` array |
| Reset | Just sets progress to 0 | Cancels rAF, then resets |

---

## Common Pitfalls to Avoid

- **Fixed increment per frame:** `progress += 0.5` is frame-rate-dependent — use elapsed time.
- **Not cancelling on pause:** Starting a new rAF loop without cancelling the old one runs two loops simultaneously — the bar will animate at double speed.
- **Not cleaning up on unmount:** The rAF callback fires after unmount and tries to update state on a dead component.
- **Shared timer for all bars:** If one bar pauses, it freezes the others.

---

## Key Takeaways

- `requestAnimationFrame` + `cancelAnimationFrame` — always in pairs.
- Timestamp-based progress (`elapsed / duration`) ensures frame-rate independence.
- Store start time and start progress separately so resume works correctly.
- `useRef` array for rAF IDs — cancellation needs the ID, and storing it in state causes unnecessary re-renders.
- Cleanup `useEffect` cancels all rAF loops — this is non-negotiable.
