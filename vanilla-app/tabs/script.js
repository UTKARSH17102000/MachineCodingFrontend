'use strict';

(function init() {
  const tablist = document.querySelector('[role="tablist"]');
  const tabs    = [...tablist.querySelectorAll('[role="tab"]')];

  function activateTab(tab) {
    tabs.forEach((t) => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
      document.getElementById(t.getAttribute('aria-controls')).setAttribute('hidden', '');
    });
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.focus();
    document.getElementById(tab.getAttribute('aria-controls')).removeAttribute('hidden');
  }

  tablist.addEventListener('keydown', (e) => {
    const idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); activateTab(tabs[(idx + 1) % tabs.length]); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); activateTab(tabs[(idx - 1 + tabs.length) % tabs.length]); }
    if (e.key === 'Home')       { e.preventDefault(); activateTab(tabs[0]); }
    if (e.key === 'End')        { e.preventDefault(); activateTab(tabs[tabs.length - 1]); }
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab));
  });
})();
