'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const FILE_TREE = [
  { id: 'src', name: 'src', type: 'folder', children: [
    { id: 'components', name: 'components', type: 'folder', children: [
      { id: 'Button.jsx',  name: 'Button.jsx',  type: 'file' },
      { id: 'Input.jsx',   name: 'Input.jsx',   type: 'file' },
      { id: 'Modal.jsx',   name: 'Modal.jsx',   type: 'file' },
    ]},
    { id: 'hooks', name: 'hooks', type: 'folder', children: [
      { id: 'useTheme.js', name: 'useTheme.js', type: 'file' },
      { id: 'useDebounce.js', name: 'useDebounce.js', type: 'file' },
    ]},
    { id: 'App.jsx',   name: 'App.jsx',   type: 'file' },
    { id: 'main.jsx',  name: 'main.jsx',  type: 'file' },
  ]},
  { id: 'public', name: 'public', type: 'folder', children: [
    { id: 'favicon.ico', name: 'favicon.ico', type: 'file' },
    { id: 'robots.txt',  name: 'robots.txt',  type: 'file' },
  ]},
  { id: 'package.json', name: 'package.json', type: 'file' },
  { id: 'vite.config.js', name: 'vite.config.js', type: 'file' },
];

const FILE_ICONS   = { js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️', css: '🎨', json: '📋', html: '🌐', ico: '🖼', txt: '📄' };
const FOLDER_ICONS = { open: '📂', closed: '📁' };

// ── State ─────────────────────────────────────────────────────────────────────
const expanded = new Set();
let selectedId = null;

// ── Logic ─────────────────────────────────────────────────────────────────────
function getFileIcon(name) {
  const ext = name.split('.').pop();
  return FILE_ICONS[ext] ?? '📄';
}

function getVisibleNodes(nodes, result = []) {
  nodes.forEach((node) => {
    result.push(node);
    if (node.type === 'folder' && expanded.has(node.id)) getVisibleNodes(node.children, result);
  });
  return result;
}

// ── Render ─────────────────────────────────────────────────────────────────────
function renderNode(node, depth, parentList) {
  const li = document.createElement('li');
  li.className = 'tree-node';
  li.setAttribute('role', 'treeitem');
  li.setAttribute('aria-level', depth);
  if (node.type === 'folder') li.setAttribute('aria-expanded', expanded.has(node.id) ? 'true' : 'false');
  li.setAttribute('aria-selected', node.id === selectedId ? 'true' : 'false');

  const isExpanded = node.type === 'folder' && expanded.has(node.id);
  const icon = node.type === 'folder' ? (isExpanded ? FOLDER_ICONS.open : FOLDER_ICONS.closed) : getFileIcon(node.name);

  const btn = document.createElement('button');
  btn.className = 'node-row' + (node.id === selectedId ? ' selected' : '');
  btn.style.paddingLeft = `${0.75 + (depth - 1) * 1.25}rem`;
  btn.setAttribute('data-id', node.id);
  btn.setAttribute('aria-label', `${node.name}${node.type === 'folder' ? ', folder' : ', file'}`);
  btn.tabIndex = depth === 1 && parentList.children.length === 0 ? 0 : -1;

  const chevron = document.createElement('span');
  chevron.className = 'node-chevron' + (isExpanded ? ' open' : '');
  chevron.textContent = node.type === 'folder' ? '›' : '';
  chevron.setAttribute('aria-hidden', 'true');

  const iconEl = document.createElement('span');
  iconEl.className = 'node-icon';
  iconEl.textContent = icon;
  iconEl.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.textContent = node.name;

  btn.appendChild(chevron);
  btn.appendChild(iconEl);
  btn.appendChild(label);
  li.appendChild(btn);

  if (node.type === 'folder') {
    const childList = document.createElement('ul');
    childList.className = 'children';
    childList.setAttribute('role', 'group');
    if (!isExpanded) childList.setAttribute('hidden', '');
    node.children.forEach((child) => renderNode(child, depth + 1, childList));
    li.appendChild(childList);
  }

  btn.addEventListener('click', () => {
    if (node.type === 'folder') {
      if (expanded.has(node.id)) expanded.delete(node.id); else expanded.add(node.id);
    }
    selectedId = node.id;
    document.getElementById('selectedFile').textContent = node.name;
    render();
    // After render() rebuilds the DOM, focus the newly created button for this node
    const newBtn = document.querySelector(`[data-id="${node.id}"]`);
    if (newBtn) newBtn.focus();
  });

  parentList.appendChild(li);
}

function render() {
  const tree = document.getElementById('tree');
  tree.innerHTML = '';
  FILE_TREE.forEach((node) => renderNode(node, 1, tree));

  // Keyboard: Arrow keys navigate visible nodes
  tree.querySelectorAll('.node-row').forEach((btn, _, all) => {
    btn.addEventListener('keydown', (e) => {
      const allBtns = [...tree.querySelectorAll('.node-row')];
      const idx = allBtns.indexOf(btn);
      if (e.key === 'ArrowDown') { e.preventDefault(); allBtns[idx + 1]?.focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); allBtns[idx - 1]?.focus(); }
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); btn.click();
      }
      if (e.key === 'Home') { e.preventDefault(); allBtns[0]?.focus(); }
      if (e.key === 'End')  { e.preventDefault(); allBtns[allBtns.length - 1]?.focus(); }
    });
  });
}

render();
