'use strict';

(function init() {
  const track     = document.getElementById('carouselTrack');
  const slides    = [...track.querySelectorAll('.slide')];
  const dotsEl    = document.getElementById('dots');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  const ppBtn     = document.getElementById('playPauseBtn');
  const carousel  = document.getElementById('carousel');
  const TOTAL     = slides.length;
  const INTERVAL  = 3500;

  let current  = 0;
  let playing  = true;
  let timer    = null;
  let pointerX = 0;

  // Build dots
  const dots = slides.map((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'dot';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(btn);
    return btn;
  });

  function render(idx) {
    track.style.transform = `translateX(-${idx * 100}%)`;
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i === idx ? 'false' : 'true'));
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
    current = idx;
  }

  function goTo(idx) { render((idx + TOTAL) % TOTAL); }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }
  function stopAutoplay() { clearInterval(timer); timer = null; }

  function togglePlay() {
    playing = !playing;
    ppBtn.textContent = playing ? '⏸' : '▶';
    ppBtn.setAttribute('aria-label', playing ? 'Pause autoplay' : 'Resume autoplay');
    if (playing) startAutoplay(); else stopAutoplay();
  }

  nextBtn.addEventListener('click', () => { goTo(current + 1); if (playing) startAutoplay(); });
  prevBtn.addEventListener('click', () => { goTo(current - 1); if (playing) startAutoplay(); });
  ppBtn.addEventListener('click', togglePlay);

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', () => { if (playing) startAutoplay(); });

  // Keyboard
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prev(); if (playing) startAutoplay(); }
    if (e.key === 'ArrowRight') { next(); if (playing) startAutoplay(); }
  });

  // Swipe
  track.addEventListener('pointerdown', (e) => { pointerX = e.clientX; });
  track.addEventListener('pointerup',   (e) => {
    const delta = e.clientX - pointerX;
    if (Math.abs(delta) > 50) { if (delta < 0) next(); else prev(); if (playing) startAutoplay(); }
  });

  render(0);
  startAutoplay();
})();
