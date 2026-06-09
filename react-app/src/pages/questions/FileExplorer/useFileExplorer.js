import { useState, useCallback, useMemo } from 'react';
import { FILE_SYSTEM } from './mockData';

// Core design: `path` stores actual node OBJECTS (not IDs).
//
// This gives O(1) for every navigation operation:
//   navigateInto(folder)      → array push         O(1)  no tree lookup needed
//   navigateToBreadcrumb(i)   → array slice         O(1)  objects already in memory
//   currentFolder             → path[last]          O(1)  direct array access
//   currentFolder.children    → property access     O(1)  no traversal
//
// Contrast with path-as-IDs (the naive approach): every navigation would
// require a findNodeById() tree traversal — O(n) where n = total node count.
// At scale (thousands of files) that lag is user-visible.

export function useFileExplorer() {
  const [path, setPath] = useState([FILE_SYSTEM]);

  const currentFolder = path[path.length - 1];

  // useMemo on sortedItems
  // WHY: Sorting is O(n log n). Without memo it re-runs on every parent render —
  // including renders triggered by unrelated causes (theme toggle, context updates).
  // WHAT IT IMPROVES: The sort executes only when currentFolder reference changes,
  // i.e., when the user actually navigates. All other re-renders skip it entirely.
  const sortedItems = useMemo(() => {
    const items = currentFolder.children ?? [];
    return [...items].sort((a, b) => {
      // Folders before files (mirrors every major OS file browser)
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      // localeCompare: handles accented characters and locale-specific ordering
      // correctly — 'é' sorts near 'e' rather than at the end of the alphabet.
      return a.name.localeCompare(b.name);
    });
  }, [currentFolder]);

  // useCallback on navigateInto
  // WHY: Without this, a new function is created on every render. ExplorerItem is
  // wrapped in React.memo, but memo bails out when props change — and a new function
  // reference counts as a changed prop. With useCallback, the reference is stable.
  // WHAT IT IMPROVES: Memoized ExplorerItem components skip re-renders when the
  // parent re-renders for reasons unrelated to the grid (theme, unrelated state).
  const navigateInto = useCallback((folder) => {
    setPath((prev) => [...prev, folder]);
  }, []);

  // useCallback on navigateToBreadcrumb
  // Same reasoning as navigateInto — stable reference enables memo on consumers.
  // slice(0, index + 1) keeps elements 0..index, dropping all deeper levels.
  // Clicking index 0 (Root) → slice(0,1) → [ROOT] — no special-casing needed.
  const navigateToBreadcrumb = useCallback((index) => {
    setPath((prev) => prev.slice(0, index + 1));
  }, []);

  return {
    path,
    currentFolder,
    sortedItems,
    navigateInto,
    navigateToBreadcrumb,
  };
}
