'use strict';

// ── Render ─────────────────────────────────────────────────────────────────────
function openItem(header, panel) {
  header.setAttribute('aria-expanded', 'true');
  panel.removeAttribute('hidden');
  // Force reflow so the browser registers height:0 before transitioning to target height
  void panel.offsetHeight;
  panel.style.height = panel.scrollHeight + 'px';
}

function closeItem(header, panel) {
  header.setAttribute('aria-expanded', 'false');
  panel.style.height = panel.scrollHeight + 'px';
  requestAnimationFrame(() => { panel.style.height = '0'; });
  panel.addEventListener('transitionend', () => {
    if (panel.style.height === '0px') panel.setAttribute('hidden', '');
  }, { once: true });
}

// ── Boot ──────────────────────────────────────────────────────────────────────
(function init() {
  const accordion = document.getElementById('accordion');
  const headers = [...accordion.querySelectorAll('.accordion-header')];

  function getMode() { return accordion.dataset.mode; }

  headers.forEach((header, index) => {
    const panelId = header.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);

    header.addEventListener('click', () => {
      const isOpen = header.getAttribute('aria-expanded') === 'true';
      if (getMode() === 'single') {
        headers.forEach((h) => {
          if (h !== header && h.getAttribute('aria-expanded') === 'true') {
            closeItem(h, document.getElementById(h.getAttribute('aria-controls')));
          }
        });
      }
      if (isOpen) closeItem(header, panel); else openItem(header, panel);
    });

    // Keyboard: ArrowDown/Up move focus
    header.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); headers[(index + 1) % headers.length].focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); headers[(index - 1 + headers.length) % headers.length].focus(); }
      if (e.key === 'Home') { e.preventDefault(); headers[0].focus(); }
      if (e.key === 'End')  { e.preventDefault(); headers[headers.length - 1].focus(); }
    });
  });

  // Mode toggle
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      accordion.dataset.mode = btn.dataset.mode;
    });
  });
})();
