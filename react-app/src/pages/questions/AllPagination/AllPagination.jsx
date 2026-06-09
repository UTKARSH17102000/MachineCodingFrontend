import { useState } from 'react';
import { usePagination } from '../Pagination/usePagination';
import { useLoadMore } from './useLoadMore';
import styles from './AllPagination.module.css';

const ALL_ITEMS = Array.from({ length: 42 }, (_, i) => ({ id: i + 1, title: `Article ${i + 1}`, summary: `A brief summary for article number ${i + 1}.` }));

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}

function PagedList() {
  const { currentPage, totalPages, pageData, goTo, goNext, goPrev, canGoNext, canGoPrev } = usePagination({ data: ALL_ITEMS, pageSize: 5 });
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className={styles.variant}>
      <h2 className={styles.variantTitle}>1. Page Numbers with Ellipsis</h2>
      <ul className={styles.list}>
        {pageData.map((item) => <li key={item.id} className={styles.item}><strong>{item.title}</strong><span>{item.summary}</span></li>)}
      </ul>
      <nav className={styles.pageControls} aria-label="Page number pagination">
        <button className={styles.pgBtn} onClick={goPrev} disabled={!canGoPrev} aria-label="Prev">← Prev</button>
        {pageNumbers.map((p, i) => p === '...'
          ? <span key={i} className={styles.ellipsis}>…</span>
          : <button key={p} className={`${styles.pgNum} ${p === currentPage ? styles.active : ''}`} onClick={() => goTo(p)} aria-current={p === currentPage ? 'page' : undefined}>{p}</button>
        )}
        <button className={styles.pgBtn} onClick={goNext} disabled={!canGoNext} aria-label="Next">Next →</button>
      </nav>
    </div>
  );
}

function LoadMoreList() {
  const { visibleItems, hasMore, loadMore } = useLoadMore(ALL_ITEMS, 5);
  return (
    <div className={styles.variant}>
      <h2 className={styles.variantTitle}>2. Load More</h2>
      <ul className={styles.list}>
        {visibleItems.map((item) => <li key={item.id} className={styles.item}><strong>{item.title}</strong><span>{item.summary}</span></li>)}
      </ul>
      {hasMore && <button className={styles.loadMoreBtn} onClick={loadMore}>Load more ({ALL_ITEMS.length - visibleItems.length} remaining)</button>}
      {!hasMore && <p className={styles.endMsg}>All {ALL_ITEMS.length} articles loaded.</p>}
    </div>
  );
}

function JumpToPageList() {
  const { currentPage, totalPages, pageData, goTo, canGoNext, canGoPrev, goNext, goPrev } = usePagination({ data: ALL_ITEMS, pageSize: 5 });
  const [input, setInput] = useState('');

  function handleJump(e) {
    e.preventDefault();
    const n = parseInt(input, 10);
    if (n >= 1 && n <= totalPages) { goTo(n); setInput(''); }
  }

  return (
    <div className={styles.variant}>
      <h2 className={styles.variantTitle}>3. Jump to Page</h2>
      <ul className={styles.list}>
        {pageData.map((item) => <li key={item.id} className={styles.item}><strong>{item.title}</strong><span>{item.summary}</span></li>)}
      </ul>
      <div className={styles.jumpControls}>
        <button className={styles.pgBtn} onClick={goPrev} disabled={!canGoPrev}>← Prev</button>
        <span className={styles.pageInfo}>Page <strong>{currentPage}</strong> of {totalPages}</span>
        <button className={styles.pgBtn} onClick={goNext} disabled={!canGoNext}>Next →</button>
        <form className={styles.jumpForm} onSubmit={handleJump} aria-label="Jump to page">
          <input
            className={styles.jumpInput}
            type="number"
            min={1}
            max={totalPages}
            placeholder="Page #"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={`Enter page number (1–${totalPages})`}
          />
          <button className={styles.jumpBtn} type="submit">Go</button>
        </form>
      </div>
    </div>
  );
}

export default function AllPagination() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>All Pagination Types</h1>
        <p className={styles.subheading}>Three patterns over the same dataset — page numbers, load more, and jump-to-page.</p>
      </header>
      <PagedList />
      <LoadMoreList />
      <JumpToPageList />
    </section>
  );
}
