'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────

const ALL_ITEMS = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  description: `This is the description for item ${i + 1}.`,
}));

const PAGE_SIZE = 8;

// ── State ─────────────────────────────────────────────────────────────────────

let currentPage = 1;

// ── DOM refs ──────────────────────────────────────────────────────────────────

const metaEl     = document.getElementById('meta');
const listEl     = document.getElementById('item-list');
const controlsEl = document.getElementById('controls');

// ── Pure logic ────────────────────────────────────────────────────────────────

function getTotalPages(data, pageSize) {
  return Math.max(1, Math.ceil(data.length / pageSize));
}

function getPageSlice(data, page, pageSize) {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const candidates = [1, total, current - 1, current, current + 1].filter(
    (p) => p >= 1 && p <= total
  );
  const sorted = [...new Set(candidates)].sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const total    = getTotalPages(ALL_ITEMS, PAGE_SIZE);
  const items    = getPageSlice(ALL_ITEMS, currentPage, PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx   = Math.min(currentPage * PAGE_SIZE, ALL_ITEMS.length);
  const canPrev  = currentPage > 1;
  const canNext  = currentPage < total;

  metaEl.textContent = `Showing ${startIdx}–${endIdx} of ${ALL_ITEMS.length} items`;

  listEl.innerHTML = items
    .map(
      (item) => `
      <li class="list-item">
        <span class="item-id">#${item.id}</span>
        <div>
          <p class="item-name">${item.name}</p>
          <p class="item-desc">${item.description}</p>
        </div>
      </li>`
    )
    .join('');

  const pageNums = buildPageNumbers(currentPage, total);

  controlsEl.innerHTML = `
    <button class="btn-nav" id="btn-prev" ${canPrev ? '' : 'disabled'} aria-label="Previous page">
      ← Prev
    </button>
    <div class="pages">
      ${pageNums
        .map((p) =>
          p === '...'
            ? `<span class="ellipsis">…</span>`
            : `<button class="btn-page ${p === currentPage ? 'active' : ''}"
                       data-page="${p}"
                       aria-current="${p === currentPage ? 'page' : 'false'}">
                 ${p}
               </button>`
        )
        .join('')}
    </div>
    <button class="btn-nav" id="btn-next" ${canNext ? '' : 'disabled'} aria-label="Next page">
      Next →
    </button>
  `;

  document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; render(); }
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentPage < total) { currentPage++; render(); }
  });

  controlsEl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      render();
    });
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

render();
