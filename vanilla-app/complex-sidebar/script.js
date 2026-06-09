'use strict';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

(function init() {
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('overlay');
  const toggleBtn = document.getElementById('toggleBtn');
  const closeBtn  = document.getElementById('closeBtn');

  // ── Expand/collapse ────────────────────────────────────────────────────────
  sidebar.querySelectorAll('.expandable').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      const subId = btn.getAttribute('aria-controls');
      const sub = document.getElementById(subId);
      if (sub) sub.toggleAttribute('hidden', isOpen);
    });
  });

  // ── Open / Close ───────────────────────────────────────────────────────────
  function open() {
    sidebar.classList.add('open');
    overlay.removeAttribute('hidden');
    sidebar.setAttribute('aria-modal', 'true');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.textContent = '✕ Close sidebar';
    toggleBtn.setAttribute('aria-label', 'Close sidebar');
    closeBtn.focus();
  }

  function close() {
    sidebar.classList.remove('open');
    overlay.setAttribute('hidden', '');
    sidebar.setAttribute('aria-modal', 'false');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = '☰ Open sidebar';
    toggleBtn.setAttribute('aria-label', 'Open sidebar');
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) close(); else open();
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // ── Focus trap ─────────────────────────────────────────────────────────────
  sidebar.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    // offsetParent is null for position:fixed elements even when visible — use computed style instead
    const focusable = [...sidebar.querySelectorAll(FOCUSABLE)].filter((el) => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden';
    });
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Non-sidebar clicks don't escape when sidebar closed
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
  });
})();
