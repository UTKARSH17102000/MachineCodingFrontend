import { useState } from 'react';

export function useLoadMore(allItems, pageSize = 6) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const loadMore = () => setVisibleCount((c) => Math.min(c + pageSize, allItems.length));
  const reset    = () => setVisibleCount(pageSize);

  return {
    visibleItems: allItems.slice(0, visibleCount),
    hasMore: visibleCount < allItems.length,
    loadMore,
    reset,
  };
}
