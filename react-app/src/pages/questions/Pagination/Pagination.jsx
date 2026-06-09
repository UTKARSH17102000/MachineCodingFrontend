import { usePagination } from './usePagination';
import styles from './Pagination.module.css';

const MOCK_ITEMS = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  description: `This is the description for item ${i + 1}.`,
}));

const PAGE_SIZE = 8;

export default function Pagination() {
  const { currentPage, totalPages, pageData, goTo, goNext, goPrev, canGoNext, canGoPrev } =
    usePagination({ data: MOCK_ITEMS, pageSize: PAGE_SIZE });

  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, MOCK_ITEMS.length);

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Pagination</h1>
        <p className={styles.meta}>
          Showing {startIdx}–{endIdx} of {MOCK_ITEMS.length} items
        </p>
      </header>

      <ul className={styles.list} role="list">
        {pageData.map((item) => (
          <li key={item.id} className={styles.listItem}>
            <span className={styles.itemId}>#{item.id}</span>
            <div>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemDesc}>{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <nav className={styles.controls} aria-label="Pagination">
        <button
          className={styles.navBtn}
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous page"
        >
          ← Prev
        </button>

        <div className={styles.pages}>
          {pageNumbers.map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                key={p}
                className={`${styles.pageBtn} ${p === currentPage ? styles.active : ''}`}
                onClick={() => goTo(p)}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          className={styles.navBtn}
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Next page"
        >
          Next →
        </button>
      </nav>
    </section>
  );
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set(
    [1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total)
  );
  const sorted = [...pages].sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}
