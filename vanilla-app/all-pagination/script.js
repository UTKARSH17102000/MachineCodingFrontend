'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const ALL_ITEMS = Array.from({ length: 60 }, (_, i) => `Article #${i + 1}: Modern web development techniques`);
const PAGE_SIZE = 8;
const LOAD_SIZE = 6;
const TOTAL_PAGES = Math.ceil(ALL_ITEMS.length / PAGE_SIZE);

function getRange(start, end) { return ALL_ITEMS.slice(start, end); }

// ── 1. Paged ──────────────────────────────────────────────────────────────────
(function pagedPagination() {
  const list = document.getElementById('pagedList');
  const nav  = document.getElementById('pageNav');
  let current = 1;

  function getPageNumbers(cur, total) {
    const pages = [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    pages.push(1);
    if (cur > 3) pages.push('…');
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push('…');
    pages.push(total);
    return pages;
  }

  function renderItems(page) {
    const items = getRange((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    list.innerHTML = items.map((t, i) => `<li>${t}<span class="item-num">#${(page-1)*PAGE_SIZE+i+1}</span></li>`).join('');
  }

  function renderNav(page) {
    nav.innerHTML = '';
    const prev = document.createElement('button');
    prev.className = 'page-btn'; prev.textContent = '‹'; prev.disabled = page === 1;
    prev.setAttribute('aria-label', 'Previous page');
    prev.addEventListener('click', () => go(page - 1));
    nav.appendChild(prev);

    getPageNumbers(page, TOTAL_PAGES).forEach((p) => {
      if (p === '…') { const s = document.createElement('span'); s.className = 'ellipsis'; s.textContent = '…'; nav.appendChild(s); return; }
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (p === page ? ' active' : '');
      btn.textContent = p;
      btn.setAttribute('aria-current', p === page ? 'page' : undefined);
      btn.setAttribute('aria-label', `Page ${p}`);
      btn.addEventListener('click', () => go(p));
      nav.appendChild(btn);
    });

    const next = document.createElement('button');
    next.className = 'page-btn'; next.textContent = '›'; next.disabled = page === TOTAL_PAGES;
    next.setAttribute('aria-label', 'Next page');
    next.addEventListener('click', () => go(page + 1));
    nav.appendChild(next);
  }

  function go(page) { current = page; renderItems(page); renderNav(page); }
  go(1);
})();

// ── 2. Load More ──────────────────────────────────────────────────────────────
(function loadMore() {
  const list = document.getElementById('loadList');
  const btn  = document.getElementById('loadMoreBtn');
  let visible = LOAD_SIZE;

  function render() {
    list.innerHTML = ALL_ITEMS.slice(0, visible).map((t, i) => `<li>${t}<span class="item-num">#${i+1}</span></li>`).join('');
    btn.disabled = visible >= ALL_ITEMS.length;
    if (btn.disabled) btn.textContent = 'All loaded';
  }

  btn.addEventListener('click', () => { visible = Math.min(ALL_ITEMS.length, visible + LOAD_SIZE); render(); });
  render();
})();

// ── 3. Jump to Page ───────────────────────────────────────────────────────────
(function jumpTo() {
  const list  = document.getElementById('jumpList');
  const input = document.getElementById('jumpInput');
  const total = document.getElementById('jumpTotal');
  const prev  = document.getElementById('jumpPrev');
  const next  = document.getElementById('jumpNext');
  const form  = document.getElementById('jumpForm');
  let page = 1;

  total.textContent = `of ${TOTAL_PAGES}`;
  input.max = String(TOTAL_PAGES);

  function go(p) {
    page = Math.max(1, Math.min(TOTAL_PAGES, p));
    input.value = page;
    const items = getRange((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    list.innerHTML = items.map((t, i) => `<li>${t}<span class="item-num">#${(page-1)*PAGE_SIZE+i+1}</span></li>`).join('');
    prev.disabled = page === 1;
    next.disabled = page === TOTAL_PAGES;
  }

  prev.addEventListener('click', () => go(page - 1));
  next.addEventListener('click', () => go(page + 1));
  form.addEventListener('submit', (e) => { e.preventDefault(); go(parseInt(input.value, 10) || 1); });
  input.addEventListener('change', () => go(parseInt(input.value, 10) || 1));
  go(1);
})();
