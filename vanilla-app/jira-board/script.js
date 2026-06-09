'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };

// Close any open move-menus when clicking outside a card footer
document.addEventListener('click', (e) => {
  if (!e.target.closest('.card-footer')) {
    document.querySelectorAll('.move-menu').forEach((m) => m.remove());
  }
});

const state = {
  columns: [
    { id: 'todo',        title: 'To Do',      color: '#6b7280' },
    { id: 'in-progress', title: 'In Progress', color: '#6c63ff' },
    { id: 'review',      title: 'Review',      color: '#f59e0b' },
    { id: 'done',        title: 'Done',        color: '#10b981' },
  ],
  cards: {
    todo:          [
      { id: 'c1', title: 'Design system tokens', tag: 'Design',   priority: 'high'   },
      { id: 'c2', title: 'Write API specs',       tag: 'Backend',  priority: 'medium' },
      { id: 'c3', title: 'Set up CI pipeline',    tag: 'DevOps',   priority: 'low'    },
    ],
    'in-progress': [
      { id: 'c4', title: 'Build auth flow',        tag: 'Frontend', priority: 'high'   },
      { id: 'c5', title: 'Database migrations',    tag: 'Backend',  priority: 'high'   },
    ],
    review:        [{ id: 'c6', title: 'Accessibility audit', tag: 'QA', priority: 'medium' }],
    done:          [
      { id: 'c7', title: 'Project kickoff',        tag: 'Misc',     priority: 'low'    },
      { id: 'c8', title: 'Requirements gathering', tag: 'Misc',     priority: 'medium' },
    ],
  },
};

let dragCard   = null;
let dragFromCol = null;
let nextId = 100;

// ── Logic ─────────────────────────────────────────────────────────────────────
function moveCard(cardId, fromCol, toCol) {
  const card = state.cards[fromCol].find((c) => c.id === cardId);
  if (!card || fromCol === toCol) return;
  state.cards[fromCol] = state.cards[fromCol].filter((c) => c.id !== cardId);
  state.cards[toCol].push(card);
  render();
}

function addCard(colId, title) {
  state.cards[colId].push({ id: `c${nextId++}`, title, tag: 'Misc', priority: 'medium' });
  render();
}

// ── Render ─────────────────────────────────────────────────────────────────────
function renderCard(card, colId) {
  const div = document.createElement('div');
  div.className = 'card';
  div.draggable = true;
  div.setAttribute('aria-label', `${card.title}, ${card.tag}, ${card.priority} priority`);
  div.dataset.id = card.id;
  div.dataset.col = colId;

  div.innerHTML = `
    <div class="card-top">
      <span class="card-tag">${card.tag}</span>
      <span class="card-priority" style="background:${PRIORITY_COLOR[card.priority]}" aria-label="${card.priority} priority"></span>
    </div>
    <p class="card-title">${card.title}</p>
    <div class="card-footer">
      <button class="move-btn" aria-label="Move card">↔ Move</button>
    </div>
  `;

  // DnD
  div.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    dragCard = card.id; dragFromCol = colId;
    setTimeout(() => div.classList.add('dragging'), 0);
  });
  div.addEventListener('dragend', () => { div.classList.remove('dragging'); dragCard = null; dragFromCol = null; });

  // Keyboard move menu
  const footer = div.querySelector('.card-footer');
  const moveBtn = div.querySelector('.move-btn');
  let menu = null;

  moveBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent bubbling to the document close-all handler
    const existing = footer.querySelector('.move-menu');
    // Close all other open menus first
    document.querySelectorAll('.move-menu').forEach((m) => m.remove());
    if (existing) return; // was open — now closed
    menu = document.createElement('ul');
    menu.className = 'move-menu';
    menu.setAttribute('role', 'menu');
    state.columns.filter((c) => c.id !== colId).forEach((col) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      const btn = document.createElement('button');
      btn.className = 'move-menu-item';
      btn.setAttribute('role', 'menuitem');
      btn.textContent = col.title;
      btn.addEventListener('click', () => { moveCard(card.id, colId, col.id); });
      li.appendChild(btn);
      menu.appendChild(li);
    });
    footer.appendChild(menu);
    menu.querySelector('button')?.focus();
  });

  return div;
}

function renderColumn(col) {
  const section = document.createElement('section');
  section.className = 'column';
  section.dataset.col = col.id;
  section.setAttribute('aria-label', `${col.title} column`);

  const header = document.createElement('div');
  header.className = 'col-header';
  header.innerHTML = `<span class="col-dot" style="background:${col.color}"></span><h2 class="col-title">${col.title}</h2><span class="col-count">${state.cards[col.id].length}</span>`;
  section.appendChild(header);

  const list = document.createElement('div');
  list.className = 'card-list';
  state.cards[col.id].forEach((card) => list.appendChild(renderCard(card, col.id)));
  section.appendChild(list);

  // Add card
  let addForm = null;
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = '+ Add card';
  addBtn.addEventListener('click', () => {
    if (addForm) return;
    addBtn.style.display = 'none';
    addForm = document.createElement('div');
    addForm.className = 'add-form';
    const ta = document.createElement('textarea');
    ta.className = 'add-input';
    ta.rows = 2;
    ta.placeholder = 'Card title…';
    const actions = document.createElement('div');
    actions.className = 'add-actions';
    const confirm = document.createElement('button');
    confirm.className = 'add-confirm'; confirm.type = 'button'; confirm.textContent = 'Add';
    const cancel = document.createElement('button');
    cancel.className = 'add-cancel'; cancel.type = 'button'; cancel.textContent = '✕';
    actions.append(confirm, cancel);
    addForm.append(ta, actions);
    section.appendChild(addForm);
    ta.focus();

    confirm.addEventListener('click', () => { if (ta.value.trim()) addCard(col.id, ta.value.trim()); });
    cancel.addEventListener('click', () => { addForm.remove(); addBtn.style.display = ''; addForm = null; });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Escape') cancel.click(); });
  });
  section.appendChild(addBtn);

  // Drop
  section.addEventListener('dragover', (e) => { e.preventDefault(); section.classList.add('drag-over'); });
  section.addEventListener('dragleave', () => section.classList.remove('drag-over'));
  section.addEventListener('drop', (e) => {
    e.preventDefault();
    section.classList.remove('drag-over');
    if (dragCard && dragFromCol) moveCard(dragCard, dragFromCol, col.id);
  });

  return section;
}

function render() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  state.columns.forEach((col) => board.appendChild(renderColumn(col)));
}

render();
