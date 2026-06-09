import { useInfiniteScroll } from './useInfiniteScroll';
import styles from './InfiniteScroll.module.css';

function SkeletonCard() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.skeletonTag} />
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonLine} />
    </div>
  );
}

const CATEGORY_COLORS = {
  Design: '#6c63ff',
  Engineering: '#4ade80',
  Product: '#facc15',
  Marketing: '#f87171',
};

export default function InfiniteScroll() {
  const { items, isLoading, hasMore, sentinelRef } = useInfiniteScroll();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Infinite Scroll</h1>
        <p className={styles.subheading}>
          IntersectionObserver sentinel — loads next page 200px before reaching the bottom.
        </p>
      </header>

      <ul className={styles.grid} role="list" aria-label="Items list">
        {items.map((item) => (
          <li key={item.id} className={styles.card}>
            <span
              className={styles.category}
              style={{ color: CATEGORY_COLORS[item.category], borderColor: CATEGORY_COLORS[item.category] + '44' }}
            >
              {item.category}
            </span>
            <p className={styles.title}>{item.title}</p>
            <p className={styles.id}>#{String(item.id).padStart(3, '0')}</p>
          </li>
        ))}
        {isLoading && Array.from({ length: 4 }, (_, i) => <li key={`sk-${i}`}><SkeletonCard /></li>)}
      </ul>

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {!hasMore && items.length > 0 && (
        <p className={styles.end} role="status">You've reached the end — {items.length} items loaded.</p>
      )}
    </section>
  );
}
