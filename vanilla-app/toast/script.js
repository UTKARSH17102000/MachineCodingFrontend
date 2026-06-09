'use strict';

// ── Data ──────────────────────────────────────────────────────────────────────
const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
const LABELS = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

// ── Logic ─────────────────────────────────────────────────────────────────────
const containers = {};

function getContainer(position) {
  if (!containers[position]) {
    const el = document.createElement('div');
    el.className = `toast-container ${position}`;
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'false');
    document.body.appendChild(el);
    containers[position] = el;
  }
  return containers[position];
}

function showToast({ message, type = 'info', duration = 3000, position = 'bottom-right' }) {
  const container = getContainer(position);
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.id = id;

  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${ICONS[type]}</span>
    <div class="toast-body">
      <p class="toast-type">${LABELS[type]}</p>
      <p class="toast-msg">${message}</p>
    </div>
    <button class="toast-close" aria-label="Dismiss notification">✕</button>
    <div class="toast-progress" style="animation-duration:${duration}ms"></div>
  `;

  container.appendChild(toast);

  function dismiss() {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

  toast.querySelector('.toast-close').addEventListener('click', dismiss);

  if (duration > 0) setTimeout(dismiss, duration);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
(function init() {
  document.getElementById('showBtn').addEventListener('click', () => {
    const type = document.querySelector('input[name="type"]:checked')?.value ?? 'info';
    const position = document.getElementById('posSelect').value;
    const duration = parseInt(document.getElementById('durationInput').value, 10) || 3000;
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'This action cannot be undone.',
      info: 'New update is available.',
    };
    showToast({ message: messages[type], type, duration, position });
  });
})();
