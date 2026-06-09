'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
let comments = [
  { id: 'c1', author: 'u/alex_eng', time: '3h ago', text: 'Islands architecture with Astro has been a game-changer for us. Full control over hydration, zero-JS by default.', score: 142, vote: null, replies: [
    { id: 'c2', author: 'u/sara_dev', time: '2h ago', text: 'Agreed! The partial hydration story is much better than Next.js. Though you lose some DX for complex apps.', score: 67, vote: null, replies: [
      { id: 'c5', author: 'u/alex_eng', time: '1h ago', text: 'True — it shines best for content-heavy sites. For SPAs I still reach for React Router + Vite.', score: 23, vote: null, replies: [] },
    ]},
    { id: 'c3', author: 'u/frontend_dev', time: '2h ago', text: 'Have you tried it with TanStack Query? That combo is incredibly powerful.', score: 31, vote: null, replies: [] },
  ]},
  { id: 'c4', author: 'u/perf_guru', time: '4h ago', text: 'Remix\'s nested routing with loaders/actions is underrated. Proper progressive enhancement out of the box.', score: 89, vote: null, replies: [] },
];

let nextId = 100;

// ── Logic ─────────────────────────────────────────────────────────────────────
function findComment(list, id) {
  for (const c of list) {
    if (c.id === id) return c;
    const found = findComment(c.replies, id);
    if (found) return found;
  }
  return null;
}

function addReply(parentId, text) {
  const parent = findComment(comments, parentId);
  if (!parent) return;
  parent.replies.push({ id: `c${nextId++}`, author: 'u/you', time: 'just now', text, score: 0, vote: null, replies: [] });
  render();
}

function vote(id, dir) {
  const c = findComment(comments, id);
  if (!c) return;
  if (c.vote === dir) { c.vote = null; c.score += dir === 'up' ? -1 : 1; }
  else { if (c.vote !== null) c.score += c.vote === 'up' ? -1 : 1; c.vote = dir; c.score += dir === 'up' ? 1 : -1; }
  render();
}

// ── Render ─────────────────────────────────────────────────────────────────────
function renderComment(c, depth) {
  const div = document.createElement('div');
  div.className = 'comment-wrap';

  const commentEl = document.createElement('div');
  commentEl.className = 'comment';
  commentEl.setAttribute('aria-label', `Comment by ${c.author}`);

  const childrenId = `replies-${c.id}`;
  const hasReplies = c.replies.length > 0;

  commentEl.innerHTML = `
    <div class="comment-header">
      <span class="comment-author">${c.author}</span>
      <span class="comment-time">${c.time}</span>
    </div>
    <p class="comment-body">${c.text}</p>
    <div class="comment-actions">
      <button class="vote-btn${c.vote === 'up' ? ' up-active' : ''}" data-id="${c.id}" data-dir="up" aria-label="Upvote">▲ ${c.score > 0 ? c.score : ''}</button>
      <button class="vote-btn${c.vote === 'down' ? ' down-active' : ''}" data-id="${c.id}" data-dir="down" aria-label="Downvote">▼</button>
      <button class="reply-btn" data-id="${c.id}">Reply</button>
      ${hasReplies ? `<button class="collapse-btn" data-id="${c.id}" aria-expanded="true" aria-controls="${childrenId}">Hide</button>` : ''}
    </div>
    <div class="reply-form" id="form-${c.id}" hidden>
      <textarea class="reply-textarea" rows="2" placeholder="Write a reply…" aria-label="Reply to ${c.author}"></textarea>
      <button class="reply-submit" data-id="${c.id}">Submit</button>
    </div>
  `;
  div.appendChild(commentEl);

  if (hasReplies) {
    const childList = document.createElement('div');
    childList.className = 'children-list';
    childList.id = childrenId;
    c.replies.forEach((r) => childList.appendChild(renderComment(r, depth + 1)));
    div.appendChild(childList);
  }

  // Events
  commentEl.querySelector('.vote-btn[data-dir="up"]').addEventListener('click', () => { vote(c.id, 'up'); });
  commentEl.querySelector('.vote-btn[data-dir="down"]').addEventListener('click', () => { vote(c.id, 'down'); });

  commentEl.querySelector('.reply-btn').addEventListener('click', () => {
    const form = commentEl.querySelector(`#form-${c.id}`);
    form.toggleAttribute('hidden');
    if (!form.hasAttribute('hidden')) form.querySelector('textarea').focus();
  });

  const submit = commentEl.querySelector('.reply-submit');
  if (submit) {
    submit.addEventListener('click', () => {
      const ta = commentEl.querySelector('textarea');
      if (ta.value.trim()) { addReply(c.id, ta.value.trim()); }
    });
  }

  const collapseBtn = commentEl.querySelector('.collapse-btn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      const childList = div.querySelector(`#${childrenId}`);
      const isHidden = childList.hasAttribute('hidden');
      childList.toggleAttribute('hidden', !isHidden);
      collapseBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      collapseBtn.textContent = isHidden ? 'Hide' : `Show (${c.replies.length})`;
    });
  }

  return div;
}

function render() {
  const container = document.getElementById('comments');
  container.innerHTML = '';
  comments.forEach((c) => container.appendChild(renderComment(c, 1)));
}

render();
