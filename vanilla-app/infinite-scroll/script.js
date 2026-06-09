'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const TAGS = ['Frontend','Backend','DevOps','Design','Performance','Security','Testing','Architecture'];
const PAGE_SIZE = 8;
const TOTAL_ITEMS = 48;

function generatePage(page) {
  const start = page * PAGE_SIZE;
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: start + i + 1,
    tag: TAGS[(start + i) % TAGS.length],
    title: `Article #${start + i + 1}: Deep dive into modern patterns`,
    desc: 'A comprehensive look at best practices and production-proven techniques used by leading engineering teams.',
    date: `June ${(start + i) % 28 + 1}, 2026`,
  }));
}

// ── State ─────────────────────────────────────────────────────────────────────
let page    = 0;
let loading = false;
let loaded  = 0;

// ── Elements ──────────────────────────────────────────────────────────────────
const feed     = document.getElementById('feed');
const sentinel = document.getElementById('sentinel');
const endMsg   = document.getElementById('endMsg');

// ── Render ─────────────────────────────────────────────────────────────────────
function renderSkeletons() {
  return Array.from({ length: 3 }, () => {
    const el = document.createElement('div');
    el.className = 'skeleton-card';
    el.innerHTML = '<div class="skel skel-sm"></div><div class="skel skel-md"></div><div class="skel skel-lg"></div><div class="skel skel-lg2"></div><div class="skel skel-xs"></div>';
    feed.appendChild(el);
    return el;
  });
}

function renderArticles(articles) {
  articles.forEach((a) => {
    const el = document.createElement('article');
    el.className = 'article';
    el.innerHTML = `<span class="article-tag">${a.tag}</span><h2 class="article-title">${a.title}</h2><p class="article-desc">${a.desc}</p><p class="article-meta">${a.date} · 5 min read</p>`;
    feed.appendChild(el);
  });
}

// ── Logic ─────────────────────────────────────────────────────────────────────
function loadMore() {
  if (loading) return;
  loading = true;
  const skels = renderSkeletons();
  setTimeout(() => {
    skels.forEach((s) => s.remove());
    const articles = generatePage(page++);
    renderArticles(articles);
    loaded += articles.length;
    loading = false;
    if (loaded >= TOTAL_ITEMS) {
      observer.disconnect();
      endMsg.removeAttribute('hidden');
    }
  }, 800);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) loadMore();
}, { rootMargin: '200px' });

observer.observe(sentinel);
