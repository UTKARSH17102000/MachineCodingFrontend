# Nested Comments — Interview Guide

> **Category:** Recursive UI · **Difficulty:** Medium

---

## What This Question Tests

Nested Comments tests recursive rendering with mutable tree operations — specifically adding a reply to any node at any depth, and collapsing/expanding subtrees. The interviewer wants to see clean recursive data mutation (with immutability), a single recursive component, and thoughtful UX (collapse hides the subtree but keeps the "X replies" count visible).

---

## Starting Point (First 2 Minutes)

1. **Recursive component:** "A single `<Comment>` component renders itself for each reply in `comment.replies` — the nesting is unbounded."
2. **Collapse state:** "I'll keep `collapsedIds: Set<string>` at the top level — not a mutable `isCollapsed` on each comment object."
3. **Adding replies:** "Replies are added by finding the target comment id in the tree and pushing a new comment to its `replies` array — using a recursive immutable update."
4. **Unique IDs:** "`crypto.randomUUID()` for new comment ids."

---

## What the Interviewer is Looking For

- Single recursive `<Comment>` component.
- `collapsedIds: Set<string>` for expand/collapse state (not mutating comment data).
- **Immutable tree update** when adding a reply — recursive function that returns a new tree.
- Reply UI inline (text input + submit below the comment).
- Vote buttons (upvote/downvote) updating the comment's `score`.
- The collapse UI shows the reply count even when collapsed: *"3 replies hidden — click to expand."*

---

## Recommended Approach

### Step 1 — Comment data shape
```js
{
  id: 'c1',
  author: 'Alice',
  body: 'Great post!',
  score: 42,
  replies: [{ id: 'c2', ... replies: [] }]
}
```

### Step 2 — Immutable reply insertion
```js
function addReply(comments, parentId, newComment) {
  return comments.map((c) => {
    if (c.id === parentId) return { ...c, replies: [...c.replies, newComment] };
    if (c.replies.length > 0)
      return { ...c, replies: addReply(c.replies, parentId, newComment) };
    return c;
  });
}
```

### Step 3 — Recursive Comment component
```jsx
function Comment({ comment, depth, collapsedIds, onToggle, onReply, onVote }) {
  const isCollapsed = collapsedIds.has(comment.id);
  const hasReplies  = comment.replies.length > 0;
  return (
    <div className={styles.comment} style={{ '--depth': depth }}>
      {/* avatar, author, body, vote buttons, reply button */}
      {hasReplies && (
        <button onClick={() => onToggle(comment.id)}>
          {isCollapsed ? `${comment.replies.length} replies hidden` : 'Collapse'}
        </button>
      )}
      {!isCollapsed && comment.replies.map((reply) => (
        <Comment key={reply.id} comment={reply} depth={depth + 1} {...rest} />
      ))}
    </div>
  );
}
```

### Step 4 — CSS nesting via CSS variable
```css
.comment { padding-left: calc(var(--depth) * 1.5rem); }
```

---

## Optimizations Implemented

### Immutable tree update — recursive `map` approach
**What we did:** `addReply` recursively maps the comment tree, returning new objects only along the path to the target comment.
**Why it matters:** Direct mutation (`parentComment.replies.push(...)`) would bypass React's change detection since it's the same array reference. The `map` approach creates new references along the modified path — React sees the change.
**Interview signal:** Understanding React's requirement for referential changes to trigger re-renders.

### CSS variable for indentation — zero JS layout computation
**What we did:** `style={{ '--depth': depth }}` on each `<div>`, with `padding-left: calc(var(--depth) * 1.5rem)` in CSS.
**Why it matters:** An alternative is `style={{ paddingLeft: depth * 24 + 'px' }}` as an inline style — functional, but less flexible. The CSS variable approach lets you change the indent size globally in CSS without touching React code.
**Interview signal:** Using CSS variables as a data bridge between React state and CSS layout.

### Collapse shows reply count (not just "Expand")
**What we did:** Collapsed state renders `"${replies.length} replies hidden — click to expand"`.
**Why it matters:** Showing the reply count even when collapsed helps users decide whether to expand. "Expand" alone gives no information.
**Interview signal:** Thinking about the information architecture of the UX, not just the mechanics.

---

## Code Quality: Lead vs. Junior

| Aspect | Junior / Mid | Lead |
|--------|-------------|------|
| Component | Separate components per nesting level | Single recursive `<Comment>` |
| Collapse state | `isCollapsed` property on comment objects | `collapsedIds: Set` at root |
| Reply insertion | `push()` on replies array (mutation) | Recursive `map` returning new tree |
| Indentation | Hardcoded per depth or JS `paddingLeft` | CSS variable `--depth` |
| Collapsed UI | Shows/hides only | Shows reply count ("3 replies hidden") |
| Vote | Not implemented or simple toggle | Increments/decrements `score` field |

---

## Common Pitfalls to Avoid

- **Mutating the comment tree directly:** `comment.replies.push(newComment)` — React doesn't see the change because the array reference didn't change.
- **Separate components per depth:** Doesn't scale to arbitrary nesting. Use a single recursive component.
- **`isCollapsed` on the data object:** Mixes UI state into domain data. Restore this state from a `Set` at the root.
- **Not showing reply count when collapsed:** Users lose context about what's hidden.

---

## Key Takeaways

- Single recursive `<Comment>` is the correct structure — depth is unbounded.
- `collapsedIds: Set` at root keeps UI state separate from domain data.
- Immutable tree update via recursive `map` — never `.push()` on the existing array.
- CSS variable `--depth` drives indentation — a clean, single-responsibility approach.
- Show reply count when collapsed ("3 hidden") — a small UX detail that shows product thinking.
