import { useState, useCallback } from 'react';
import { TREE_DATA } from './mockTree';

function getAllDescendantIds(node) {
  const ids = [];
  function collect(n) { if (n.children?.length) n.children.forEach(collect); else ids.push(n.id); if (n.id !== node.id) ids.push(n.id); }
  node.children?.forEach(collect);
  return ids;
}

function getNodeState(node, checked) {
  if (!node.children?.length) return checked.has(node.id) ? 'checked' : 'unchecked';
  const childStates = node.children.map((c) => getNodeState(c, checked));
  if (childStates.every((s) => s === 'checked')) return 'checked';
  if (childStates.every((s) => s === 'unchecked')) return 'unchecked';
  return 'indeterminate';
}

function getAllLeafIds(node) {
  if (!node.children?.length) return [node.id];
  return node.children.flatMap(getAllLeafIds);
}

export function useTreeCheckbox() {
  const [checked, setChecked] = useState(new Set());

  const toggle = useCallback((node) => {
    setChecked((prev) => {
      const next = new Set(prev);
      const leaves = getAllLeafIds(node);
      const state = getNodeState(node, prev);
      if (state === 'checked') {
        leaves.forEach((id) => next.delete(id));
        next.delete(node.id);
      } else {
        leaves.forEach((id) => next.add(id));
        next.add(node.id);
      }
      return next;
    });
  }, []);

  const getState = useCallback((node) => getNodeState(node, checked), [checked]);

  const selectedCount = checked.size;

  return { getState, toggle, selectedCount };
}
