'use strict';

const LANGUAGES = [
  'JavaScript','TypeScript','Python','Rust','Go','Java','C++','C#','Ruby','Swift',
  'Kotlin','Dart','PHP','Scala','R','Haskell','Elixir','Clojure','F#','Zig',
];

(function init() {
  const input   = document.getElementById('comboInput');
  const list    = document.getElementById('comboList');
  const clearBtn= document.getElementById('comboClear');
  const result  = document.getElementById('comboResult');

  let debounceId = null;
  let activeIdx  = -1;
  let items      = [];
  let isOpen     = false;

  function highlight(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  }

  function renderList(query) {
    const q = query.trim().toLowerCase();
    items = q ? LANGUAGES.filter((l) => l.toLowerCase().includes(q)) : LANGUAGES;
    list.innerHTML = '';
    activeIdx = -1;

    if (items.length === 0) {
      list.innerHTML = '<li class="no-results">No languages found</li>';
      return;
    }

    items.forEach((lang, i) => {
      const li = document.createElement('li');
      li.className = 'combo-option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.id = `combo-option-${i}`;
      li.innerHTML = highlight(lang, query);
      li.addEventListener('mousedown', (e) => { e.preventDefault(); select(lang); });
      list.appendChild(li);
    });
  }

  function open() {
    isOpen = true;
    list.removeAttribute('hidden');
    input.setAttribute('aria-expanded', 'true');
    renderList(input.value);
  }

  function close() {
    isOpen = false;
    list.setAttribute('hidden', '');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIdx = -1;
  }

  function select(lang) {
    input.value = lang;
    result.textContent = `Selected: ${lang}`;
    clearBtn.removeAttribute('hidden');
    close();
  }

  function setActive(idx) {
    const opts = [...list.querySelectorAll('.combo-option')];
    opts.forEach((o, i) => o.classList.toggle('focused', i === idx));
    if (opts[idx]) {
      input.setAttribute('aria-activedescendant', opts[idx].id);
      opts[idx].scrollIntoView({ block: 'nearest' });
    }
    activeIdx = idx;
  }

  input.addEventListener('input', () => {
    clearTimeout(debounceId);
    clearBtn.toggleAttribute('hidden', input.value === '');
    debounceId = setTimeout(() => {
      if (!isOpen) open(); else renderList(input.value);
    }, 200);
  });

  input.addEventListener('focus', () => { if (!isOpen) open(); });

  input.addEventListener('keydown', (e) => {
    const opts = [...list.querySelectorAll('.combo-option')];
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((activeIdx + 1) % opts.length); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((activeIdx - 1 + opts.length) % opts.length); }
    if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0 && items[activeIdx]) select(items[activeIdx]); }
    if (e.key === 'Escape') { e.preventDefault(); close(); input.blur(); }
    if (e.key === 'Tab') close();
  });

  clearBtn.addEventListener('click', () => {
    input.value = ''; result.textContent = '';
    clearBtn.setAttribute('hidden', ''); input.focus();
    if (!isOpen) open();
  });

  document.addEventListener('mousedown', (e) => {
    if (!document.getElementById('combobox').contains(e.target)) close();
  });
})();
