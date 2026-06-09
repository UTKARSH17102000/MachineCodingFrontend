import { useState, useRef, useCallback, useEffect } from 'react';

const PAGE_SIZE = 12;
const TOTAL = 100;

function fetchPage(page) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * PAGE_SIZE;
      const items = Array.from({ length: Math.min(PAGE_SIZE, TOTAL - start) }, (_, i) => ({
        id: start + i + 1,
        title: `Item ${start + i + 1}`,
        category: ['Design', 'Engineering', 'Product', 'Marketing'][(start + i) % 4],
      }));
      resolve({ items, hasMore: start + PAGE_SIZE < TOTAL });
    }, 800);
  });
}

export function useInfiniteScroll() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const { items: newItems, hasMore: more } = await fetchPage(pageRef.current);
    pageRef.current += 1;
    setItems((prev) => [...prev, ...newItems]);
    setHasMore(more);
    setIsLoading(false);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return { items, isLoading, hasMore, sentinelRef };
}
