'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
// Same hierarchy as the React version — covers all edge cases:
//   - Empty folders   : Downloads/, public/
//   - 5-level depth   : Root > Music > Jazz > Miles Davis > *.mp3
//   - Duplicate names : README.md in react-app/ AND vue-project/ (different ids)
//   - Mixed root      : folders AND notes.txt at the root level
//
// Schema: { id, name, type, children?, ext?, size? }
//   children absent on files (leaf node), children: [] = empty folder

const FILE_SYSTEM = {
  id: 'root', name: 'Root', type: 'folder',
  children: [
    { id: 'documents', name: 'Documents', type: 'folder', children: [
      { id: 'work', name: 'Work', type: 'folder', children: [
        { id: 'projects', name: 'Projects', type: 'folder', children: [
          { id: 'react-app', name: 'react-app', type: 'folder', children: [
            { id: 'src-folder', name: 'src', type: 'folder', children: [
              { id: 'app-jsx',  name: 'App.jsx',  type: 'file', ext: 'jsx', size: '3.2 KB' },
              { id: 'main-jsx', name: 'main.jsx', type: 'file', ext: 'jsx', size: '0.8 KB' },
            ]},
            { id: 'public-folder', name: 'public', type: 'folder', children: [] }, // EMPTY
            { id: 'pkg-json',     name: 'package.json', type: 'file', ext: 'json', size: '1.1 KB' },
            { id: 'readme-react', name: 'README.md',    type: 'file', ext: 'md',   size: '4.5 KB' },
          ]},
          { id: 'vue-project', name: 'vue-project', type: 'folder', children: [
            { id: 'index-html', name: 'index.html', type: 'file', ext: 'html', size: '0.9 KB' },
            { id: 'readme-vue', name: 'README.md',  type: 'file', ext: 'md',   size: '2.1 KB' }, // duplicate name, different id
          ]},
        ]},
        { id: 'meetings', name: 'Meetings', type: 'folder', children: [
          { id: 'q1-notes', name: 'Q1-notes.docx', type: 'file', ext: 'docx', size: '48 KB' },
          { id: 'q2-notes', name: 'Q2-notes.docx', type: 'file', ext: 'docx', size: '52 KB' },
        ]},
        { id: 'annual-report', name: 'annual-report.pdf', type: 'file', ext: 'pdf', size: '2.4 MB' },
      ]},
      { id: 'personal', name: 'Personal', type: 'folder', children: [
        { id: 'budget',       name: 'budget-2025.xlsx', type: 'file', ext: 'xlsx', size: '88 KB'  },
        { id: 'travel-plans', name: 'travel-plans.pdf', type: 'file', ext: 'pdf',  size: '1.2 MB' },
      ]},
      { id: 'taxes', name: 'taxes.pdf', type: 'file', ext: 'pdf', size: '340 KB' },
    ]},
    { id: 'pictures', name: 'Pictures', type: 'folder', children: [
      { id: 'vacation', name: 'Vacation 2024', type: 'folder', children: [
        { id: 'beach',  name: 'beach.jpg',  type: 'file', ext: 'jpg', size: '3.8 MB' },
        { id: 'sunset', name: 'sunset.jpg', type: 'file', ext: 'jpg', size: '4.1 MB' },
        { id: 'hotel',  name: 'hotel.png',  type: 'file', ext: 'png', size: '2.9 MB' },
      ]},
      { id: 'profile', name: 'profile.png', type: 'file', ext: 'png', size: '780 KB' },
      { id: 'banner',  name: 'banner.jpg',  type: 'file', ext: 'jpg', size: '1.1 MB' },
    ]},
    { id: 'music', name: 'Music', type: 'folder', children: [
      { id: 'jazz', name: 'Jazz', type: 'folder', children: [
        { id: 'miles-davis', name: 'Miles Davis', type: 'folder', children: [
          { id: 'kind-of-blue', name: 'kind-of-blue.mp3',  type: 'file', ext: 'mp3',  size: '92 MB'  },
          { id: 'bitches-brew', name: 'bitches-brew.flac', type: 'file', ext: 'flac', size: '310 MB' },
        ]},
      ]},
      { id: 'favorites', name: 'favorites.m3u', type: 'file', ext: 'm3u', size: '2 KB' },
    ]},
    { id: 'videos', name: 'Videos', type: 'folder', children: [
      { id: 'tutorial',  name: 'tutorial.mp4',         type: 'file', ext: 'mp4', size: '156 MB' },
      { id: 'recording', name: 'screen-recording.mov', type: 'file', ext: 'mov', size: '48 MB'  },
    ]},
    { id: 'downloads', name: 'Downloads', type: 'folder', children: [] }, // EMPTY
    { id: 'notes-txt', name: 'notes.txt', type: 'file', ext: 'txt', size: '12 KB' },
  ],
};

// ── Extension → icon color ────────────────────────────────────────────────────
const EXT_COLORS = {
  pdf: '#ef4444',
  doc: '#3b82f6', docx: '#3b82f6',
  xls: '#22c55e', xlsx: '#22c55e',
  ppt: '#f97316', pptx: '#f97316',
  js: '#eab308',  jsx: '#eab308',
  ts: '#3b82f6',  tsx: '#3b82f6',
  html: '#f97316', css: '#38bdf8', json: '#fbbf24', md: '#94a3b8',
  png: '#a855f7', jpg: '#a855f7', jpeg: '#a855f7', gif: '#a855f7',
  svg: '#a855f7', webp: '#a855f7',
  mp3: '#ec4899', wav: '#ec4899', flac: '#ec4899', m3u: '#ec4899',
  mp4: '#14b8a6', mov: '#14b8a6',
  zip: '#6b7280', rar: '#6b7280', gz: '#6b7280',
  txt: '#94a3b8',
};
const DEFAULT_EXT_COLOR = '#8888aa';

// ── State ─────────────────────────────────────────────────────────────────────
// Core design: path stores actual node OBJECTS (not IDs) → O(1) for all ops.
//   navigateInto(folder)        → path.push(folder)         O(1)
//   navigateToBreadcrumb(i)     → path.slice(0, i+1)        O(1)
//   current folder              → path[path.length - 1]     O(1)
//   current folder's children   → currentFolder.children    O(1)
let path = [FILE_SYSTEM];

// nodeMap: id → node reference, built once at startup.
// Enables O(1) folder lookup in the click handler (no tree traversal per click).
const nodeMap = new Map();
(function buildMap(node) {
  nodeMap.set(node.id, node);
  if (node.children) node.children.forEach(buildMap);
}(FILE_SYSTEM));

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Folders before files, then alphabetical — mirrors OS file browsers.
// localeCompare handles accented characters and locale-specific ordering.
function getSortedItems(folder) {
  const items = folder.children ?? [];
  return [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// ── SVG helpers ───────────────────────────────────────────────────────────────
function folderSvg() {
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" fill="#f59e0b" opacity=".4"/>
    <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" fill="#f59e0b"/>
  </svg>`;
}

function fileSvg(ext) {
  const color = (ext && EXT_COLORS[ext.toLowerCase()]) || DEFAULT_EXT_COLOR;
  const label = ext ? ext.toUpperCase().slice(0, 4) : '';
  const textEl = label
    ? `<text x="12" y="16" text-anchor="middle" fill="${color}" font-size="5" font-weight="700" font-family="monospace">${label}</text>`
    : '';
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 2h9l4 4v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="${color}" opacity=".18"/>
    <path d="M15 2l4 4h-4V2z" fill="${color}" opacity=".45"/>
    ${textEl}
  </svg>`;
}

function emptySvg() {
  return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" fill="currentColor" opacity=".15"/>
    <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" fill="currentColor" opacity=".25"/>
  </svg>`;
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderBreadcrumb() {
  const ol = document.getElementById('breadcrumb-list');
  // Ancestors: interactive <button> with data-nav-index for delegation.
  // Current folder: non-interactive <span aria-current="page">.
  // Separators: aria-hidden="true" — decorative only.
  ol.innerHTML = path.map((folder, index) => {
    const isLast = index === path.length - 1;
    if (isLast) {
      return `<li class="breadcrumb-item">
        <span class="breadcrumb-current" aria-current="page">${escHtml(folder.name)}</span>
      </li>`;
    }
    return `<li class="breadcrumb-item">
      <button class="breadcrumb-btn" data-nav-index="${index}">${escHtml(folder.name)}</button>
      <span class="breadcrumb-sep" aria-hidden="true">›</span>
    </li>`;
  }).join('');
}

function renderGrid() {
  const wrapper = document.getElementById('grid-wrapper');
  const folder  = path[path.length - 1];
  const items   = getSortedItems(folder);

  document.getElementById('item-count').textContent =
    `${items.length} ${items.length === 1 ? 'item' : 'items'}`;

  if (items.length === 0) {
    wrapper.innerHTML = `
      <div class="empty" role="status" aria-label="Empty folder">
        ${emptySvg()}
        <p class="empty-text">This folder is empty</p>
      </div>`;
    return;
  }

  const listItems = items.map((item) => {
    const isFolder  = item.type === 'folder';
    const ext       = item.ext ?? item.name.split('.').pop();
    const icon      = isFolder ? folderSvg() : fileSvg(ext);
    const itemCount = isFolder ? (item.children ? item.children.length : 0) : null;
    const meta      = isFolder
      ? `${itemCount} item${itemCount !== 1 ? 's' : ''}`
      : (item.size ?? '');
    const ariaLabel = isFolder
      ? `${item.name}, folder, ${itemCount} item${itemCount !== 1 ? 's' : ''}`
      : `${item.name}, file${item.size ? `, ${item.size}` : ''}`;

    // data-folder-id only on folders — used by click/keyboard delegation.
    // tabindex="0" on folders makes them keyboard-focusable; -1 on files removes
    // them from the Tab order (display-only, no interaction).
    // title on .item-name shows full name on hover for truncated long names.
    return `<li class="item-wrapper">
      <div
        class="item ${isFolder ? 'item-folder' : 'item-file'}"
        role="${isFolder ? 'button' : 'presentation'}"
        tabindex="${isFolder ? '0' : '-1'}"
        ${isFolder ? `data-folder-id="${escHtml(item.id)}"` : ''}
        aria-label="${escHtml(ariaLabel)}"
      >
        <div class="item-icon">${icon}</div>
        <span class="item-name" title="${escHtml(item.name)}">${escHtml(item.name)}</span>
        <span class="item-meta">${escHtml(meta)}</span>
      </div>
    </li>`;
  }).join('');

  // role="list" restores list semantics that CSS list-style:none strips in VoiceOver/Safari.
  wrapper.innerHTML = `<ul class="grid" role="list" aria-label="Folder contents">${listItems}</ul>`;
}

function render() {
  renderBreadcrumb();
  renderGrid();
}

// ── Navigation ────────────────────────────────────────────────────────────────
function navigateInto(folder) {
  path.push(folder);
  render();
}

function navigateToBreadcrumb(index) {
  // slice(0, index + 1) keeps elements 0..index — clicking index 0 (Root)
  // gives [ROOT] with no special-casing needed.
  path = path.slice(0, index + 1);
  render();
}

// ── Event delegation ──────────────────────────────────────────────────────────
// Single listener per region (breadcrumb, grid-wrapper) — no per-item handlers.
// This avoids re-attaching listeners on every render and keeps memory usage flat.

function init() {
  render();

  // Breadcrumb: delegated click
  document.getElementById('breadcrumb-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nav-index]');
    if (!btn) return;
    navigateToBreadcrumb(Number(btn.dataset.navIndex));
  });

  const wrapper = document.getElementById('grid-wrapper');

  // Grid: delegated click — nodeMap gives O(1) folder lookup (no tree traversal)
  wrapper.addEventListener('click', (e) => {
    const el = e.target.closest('[data-folder-id]');
    if (!el) return;
    const folder = nodeMap.get(el.dataset.folderId);
    if (folder) navigateInto(folder);
  });

  // Grid: keyboard navigation
  //   Enter / Space — activate focused folder (same as click)
  //   Arrow keys    — move focus between folder items in the grid
  wrapper.addEventListener('keydown', (e) => {
    const el = e.target.closest('[data-folder-id]');
    if (!el) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft'  || e.key === 'ArrowUp') {
      const grid    = wrapper.querySelector('.grid');
      if (!grid) return;
      const folders = [...grid.querySelectorAll('[data-folder-id]')];
      const idx     = folders.indexOf(el);
      const next    = (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        ? folders[idx + 1]
        : folders[idx - 1];
      if (next) { e.preventDefault(); next.focus(); }
    }
  });
}

init();
