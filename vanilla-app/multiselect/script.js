'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const OPTIONS = [
  'React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js',
  'GraphQL', 'Docker', 'Kubernetes', 'Python', 'Rust',
  'PostgreSQL', 'Redis', 'AWS', 'Figma', 'Accessibility',
];

// ── State ─────────────────────────────────────────────────────────────────────
let selected = new Set();
let isOpen   = false;
let query    = '';
let focusIdx = -1;

// ── Elements ──────────────────────────────────────────────────────────────────
const trigger    = document.getElementById('trigger');
const chipsEl    = document.getElementById('chips');
const dropdown   = document.getElementById('dropdown');
const searchEl   = document.getElementById('search');
const listEl     = document.getElementById('optionList');
const selectAll  = document.getElementById('selectAll');
const resultEl   = document.getElementById('result');

// ── Render ─────────────────────────────────────────────────────────────────────
function getFiltered() { return query ? OPTIONS.filter((o) => o.toLowerCase().includes(query.toLowerCase())) : OPTIONS; }

function renderChips() {
  chipsEl.innerHTML = '';
  if (selected.size === 0) { chipsEl.innerHTML = '<span class="placeholder">Select skills…</span>'; return; }
  selected.forEach((opt) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `${opt} <button class="chip-remove" aria-label="Remove ${opt}" data-opt="${opt}">×</button>`;
    chipsEl.appendChild(chip);
  });
}

function renderOptions() {
  const filtered = getFiltered();
  listEl.innerHTML = '';
  filtered.forEach((opt, i) => {
    const li = document.createElement('li');
    li.className = 'option-item';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', selected.has(opt) ? 'true' : 'false');
    li.setAttribute('tabindex', '-1');
    li.dataset.opt = opt;
    li.innerHTML = `<input type="checkbox" ${selected.has(opt) ? 'checked' : ''} tabindex="-1" aria-hidden="true"> ${opt}`;
    listEl.appendChild(li);
  });
  selectAll.querySelector('input').checked = filtered.every((o) => selected.has(o));
  resultEl.textContent = `${selected.size} selected`;
}

function render() { renderChips(); renderOptions(); }

// ── Logic ─────────────────────────────────────────────────────────────────────
function open() {
  isOpen = true;
  dropdown.removeAttribute('hidden');
  trigger.setAttribute('aria-expanded', 'true');
  searchEl.value = ''; query = '';
  renderOptions();
  searchEl.focus();
}

function close() {
  isOpen = false;
  dropdown.setAttribute('hidden', '');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.focus();
}

function toggle() { if (isOpen) close(); else open(); }

function toggleOption(opt) {
  if (selected.has(opt)) selected.delete(opt); else selected.add(opt);
  render();
}

// ── Events ─────────────────────────────────────────────────────────────────────
trigger.addEventListener('click', toggle);
trigger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  if (e.key === 'Escape') close();
});

chipsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip-remove');
  if (btn) { e.stopPropagation(); selected.delete(btn.dataset.opt); render(); }
});

searchEl.addEventListener('input', () => { query = searchEl.value; renderOptions(); });

listEl.addEventListener('click', (e) => {
  const li = e.target.closest('.option-item');
  if (li) toggleOption(li.dataset.opt);
});

selectAll.addEventListener('change', () => {
  const filtered = getFiltered();
  if (selectAll.querySelector('input').checked) filtered.forEach((o) => selected.add(o));
  else filtered.forEach((o) => selected.delete(o));
  render();
});

searchEl.addEventListener('keydown', (e) => {
  const items = [...listEl.querySelectorAll('.option-item')];
  if (e.key === 'ArrowDown') { e.preventDefault(); if (items[0]) items[0].focus(); }
  if (e.key === 'Escape')    close();
});

listEl.addEventListener('keydown', (e) => {
  const items = [...listEl.querySelectorAll('.option-item')];
  const idx   = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); if (idx === 0) searchEl.focus(); else items[idx - 1]?.focus(); }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); const li = document.activeElement.closest('.option-item'); if (li) toggleOption(li.dataset.opt); }
  if (e.key === 'Escape')    close();
});

document.addEventListener('mousedown', (e) => {
  if (!document.getElementById('multiselect').contains(e.target)) close();
});

render();
