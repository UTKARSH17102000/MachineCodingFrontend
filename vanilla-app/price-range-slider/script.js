'use strict';

(function init() {
  const minRange   = document.getElementById('minRange');
  const maxRange   = document.getElementById('maxRange');
  const minDisplay = document.getElementById('minDisplay');
  const maxDisplay = document.getElementById('maxDisplay');
  const track      = document.getElementById('sliderTrack');
  const result     = document.getElementById('result');
  const MIN = 0, MAX = 1000;

  function update() {
    let lo = parseInt(minRange.value, 10);
    let hi = parseInt(maxRange.value, 10);
    if (lo > hi - 10) { lo = hi - 10; minRange.value = lo; }
    if (hi < lo + 10) { hi = lo + 10; maxRange.value = hi; }

    const pctLo = ((lo - MIN) / (MAX - MIN)) * 100;
    const pctHi = ((hi - MIN) / (MAX - MIN)) * 100;

    track.style.background = `linear-gradient(to right, var(--border) ${pctLo}%, var(--primary) ${pctLo}%, var(--primary) ${pctHi}%, var(--border) ${pctHi}%)`;

    minRange.setAttribute('aria-valuenow', String(lo));
    maxRange.setAttribute('aria-valuenow', String(hi));

    minDisplay.textContent = `$${lo}`;
    maxDisplay.textContent = `$${hi}`;
    result.textContent = `Showing results for $${lo} – $${hi}`;

    // Z-index: when thumbs are very close, let the one being dragged be on top
    minRange.style.zIndex = lo > MAX - 100 ? '5' : '3';
    maxRange.style.zIndex = lo > MAX - 100 ? '3' : '5';
  }

  minRange.addEventListener('input', update);
  maxRange.addEventListener('input', update);
  update();
})();
