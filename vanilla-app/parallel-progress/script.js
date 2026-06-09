'use strict';

const BARS = [
  { name: 'Download A', duration: 4000, color: '#6c63ff' },
  { name: 'Download B', duration: 7000, color: '#10b981' },
  { name: 'Upload C',   duration: 5500, color: '#f59e0b' },
  { name: 'Process D',  duration: 9000, color: '#ef4444' },
  { name: 'Sync E',     duration: 3500, color: '#60a5fa' },
];

(function init() {
  const demo = document.getElementById('demo');

  BARS.forEach(({ name, duration, color }) => {
    const row      = document.createElement('div');
    row.className  = 'bar-row';

    const track    = document.createElement('div');
    track.className = 'track';
    const fill     = document.createElement('div');
    fill.className = 'fill';
    fill.style.background = color;
    track.appendChild(fill);

    const info     = document.createElement('div');
    info.className = 'bar-info';
    const nameEl   = document.createElement('span');
    nameEl.className = 'bar-name';
    nameEl.textContent = name;
    const pctEl    = document.createElement('span');
    pctEl.className = 'bar-pct';
    pctEl.textContent = '0%';
    info.append(nameEl, pctEl);

    const controls    = document.createElement('div');
    controls.className = 'bar-controls';
    const startBtn    = document.createElement('button');
    startBtn.className = 'btn-sm'; startBtn.textContent = 'Start';
    const pauseBtn    = document.createElement('button');
    pauseBtn.className = 'btn-sm'; pauseBtn.textContent = 'Pause'; pauseBtn.disabled = true;
    const resetBtn    = document.createElement('button');
    resetBtn.className = 'btn-sm'; resetBtn.textContent = 'Reset';
    controls.append(startBtn, pauseBtn, resetBtn);

    row.append(info, track, controls);
    demo.appendChild(row);

    // State
    let rafId    = null;
    let elapsed  = 0;
    let lastTime = null;
    let running  = false;

    function setProgress(pct) {
      fill.style.width = pct + '%';
      pctEl.textContent = Math.round(pct) + '%';
    }

    function tick(now) {
      if (lastTime !== null) elapsed += now - lastTime;
      lastTime = now;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) { rafId = requestAnimationFrame(tick); }
      else { running = false; startBtn.disabled = true; pauseBtn.disabled = true; }
    }

    startBtn.addEventListener('click', () => {
      if (running) return;
      running = true; lastTime = null;
      startBtn.disabled = true; pauseBtn.disabled = false;
      rafId = requestAnimationFrame(tick);
    });

    pauseBtn.addEventListener('click', () => {
      if (!running) { running = true; lastTime = null; pauseBtn.textContent = 'Pause'; startBtn.disabled = true; rafId = requestAnimationFrame(tick); }
      else { running = false; cancelAnimationFrame(rafId); pauseBtn.textContent = 'Resume'; startBtn.disabled = true; }
    });

    resetBtn.addEventListener('click', () => {
      cancelAnimationFrame(rafId);
      elapsed = 0; running = false; lastTime = null;
      setProgress(0);
      startBtn.disabled = false; pauseBtn.disabled = true; pauseBtn.textContent = 'Pause';
    });
  });
})();
