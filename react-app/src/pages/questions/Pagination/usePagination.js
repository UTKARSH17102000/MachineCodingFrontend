import { useState, useMemo } from 'react';

/**
 * Generic hook for client-side pagination.
 *
 * @param {{ data: Array, pageSize?: number }} options
 */
export function usePagination({ data = [], pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  function goTo(page) {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }

  return {
    currentPage,
    totalPages,
    pageData,
    goTo,
    goNext: () => goTo(currentPage + 1),
    goPrev: () => goTo(currentPage - 1),
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
  };
}
