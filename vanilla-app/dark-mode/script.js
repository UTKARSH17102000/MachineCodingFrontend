'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'mc-theme';

// ── Logic ─────────────────────────────────────────────────────────────────────
function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// ── Render ────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);

  const btn = document.getElementById('toggleBtn');
  const icon = document.getElementById('icon');
  const label = document.getElementById('label');

  const isDark = theme === 'dark';
  icon.textContent = isDark ? '☀️' : '🌙';
  label.textContent = isDark ? 'Switch to Light' : 'Switch to Dark';
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  btn.setAttribute('aria-pressed', String(!isDark));
}

// ── Boot ──────────────────────────────────────────────────────────────────────
(function init() {
  let theme = getInitialTheme();
  applyTheme(theme);

  document.getElementById('toggleBtn').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
  });
})();
