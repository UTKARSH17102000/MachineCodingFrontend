'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const TREE = [
  { id: 'frontend', label: 'Frontend', children: [
    { id: 'react', label: 'React', children: [
      { id: 'hooks',   label: 'Hooks',   children: [] },
      { id: 'context', label: 'Context', children: [] },
      { id: 'routing', label: 'Routing', children: [] },
    ]},
    { id: 'css', label: 'CSS', children: [
      { id: 'flexbox',  label: 'Flexbox',      children: [] },
      { id: 'grid',     label: 'CSS Grid',     children: [] },
      { id: 'modules',  label: 'CSS Modules',  children: [] },
    ]},
  ]},
  { id: 'backend', label: 'Backend', children: [
    { id: 'node', label: 'Node.js', children: [
      { id: 'express',  label: 'Express',  children: [] },
      { id: 'fastify',  label: 'Fastify',  children: [] },
    ]},
    { id: 'db', label: 'Databases', children: [
      { id: 'postgres', label: 'PostgreSQL', children: [] },
      { id: 'redis',    label: 'Redis',      children: [] },
    ]},
  ]},
  { id: 'devops', label: 'DevOps', children: [
    { id: 'docker', label: 'Docker', children: [] },
    { id: 'ci',     label: 'CI/CD',  children: [] },
  ]},
];

// ── State ─────────────────────────────────────────────────────────────────────
const checked = new Set();

// ── Logic ─────────────────────────────────────────────────────────────────────
function getAllLeafIds(node) {
  if (!node.children?.length) return [node.id];
  return node.children.flatMap(getAllLeafIds);
}

function getNodeState(node) {
  if (!node.children?.length) return checked.has(node.id) ? 'checked' : 'unchecked';
  const childStates = node.children.map(getNodeState);
  if (childStates.every((s) => s === 'checked')) return 'checked';
  if (childStates.every((s) => s === 'unchecked')) return 'unchecked';
  return 'indeterminate';
}

function toggle(node) {
  const state = getNodeState(node);
  const leaves = getAllLeafIds(node);
  if (state === 'checked') { leaves.forEach((id) => checked.delete(id)); checked.delete(node.id); }
  else { leaves.forEach((id) => checked.add(id)); checked.add(node.id); }
  render();
}

function countLeaves() {
  let n = 0;
  function count(nodes) { nodes.forEach((node) => { if (!node.children?.length) { if (checked.has(node.id)) n++; } else count(node.children); }); }
  count(TREE);
  return n;
}

// ── Render ─────────────────────────────────────────────────────────────────────
function renderNode(node, depth, parentList) {
  const state = getNodeState(node);

  const li = document.createElement('li');
  li.className = 'tree-node';
  li.setAttribute('role', 'treeitem');
  li.setAttribute('aria-level', depth);
  li.setAttribute('aria-checked', state === 'indeterminate' ? 'mixed' : state === 'checked' ? 'true' : 'false');

  const label = document.createElement('label');
  label.className = 'node-label';
  label.style.paddingLeft = `${(depth - 1) * 1.25}rem`;

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'node-checkbox';
  cb.checked = state === 'checked';
  cb.indeterminate = state === 'indeterminate';
  cb.setAttribute('aria-label', node.label);

  const text = document.createElement('span');
  text.className = 'node-text';
  text.textContent = node.label;

  label.appendChild(cb);
  label.appendChild(text);

  if (node.children?.length) {
    const count = document.createElement('span');
    count.className = 'node-count';
    count.textContent = node.children.length;
    label.appendChild(count);
  }

  cb.addEventListener('change', () => toggle(node));
  li.appendChild(label);

  if (node.children?.length) {
    const childList = document.createElement('ul');
    childList.className = 'children';
    childList.setAttribute('role', 'group');
    node.children.forEach((child) => renderNode(child, depth + 1, childList));
    li.appendChild(childList);
  }

  parentList.appendChild(li);
}

function render() {
  const tree = document.getElementById('tree');
  tree.innerHTML = '';
  TREE.forEach((node) => renderNode(node, 1, tree));
  const n = countLeaves();
  document.getElementById('selectionInfo').textContent = `${n} item${n !== 1 ? 's' : ''} selected`;
}

render();
