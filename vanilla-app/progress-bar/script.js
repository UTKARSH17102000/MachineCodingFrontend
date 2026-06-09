'use strict';

(function init() {
  // Determinate
  const detTrack = document.querySelector('[aria-label="File upload progress"]');
  const detFill  = document.getElementById('det-fill');
  const detVal   = document.getElementById('det-val');
  let detTimer   = null;
  let pct        = 0;

  function setDet(v) {
    pct = Math.max(0, Math.min(100, v));
    detFill.style.width = pct + '%';
    detTrack.setAttribute('aria-valuenow', String(Math.round(pct)));
    detVal.textContent = Math.round(pct) + '%';
  }

  document.getElementById('detStart').addEventListener('click', (e) => {
    if (detTimer) return;
    e.target.disabled = true;
    detTimer = setInterval(() => {
      setDet(pct + (Math.random() * 8 + 2));
      if (pct >= 100) { clearInterval(detTimer); detTimer = null; }
    }, 200);
  });

  document.getElementById('detReset').addEventListener('click', () => {
    clearInterval(detTimer); detTimer = null;
    setDet(0);
    document.getElementById('detStart').disabled = false;
  });

  // Stepped
  const STEPS = 5;
  let step = 0;
  const steppedBar  = document.getElementById('stepped-bar');
  const stepVal     = document.getElementById('step-val');
  const stepPrevBtn = document.getElementById('stepPrev');
  const stepNextBtn = document.getElementById('stepNext');
  const segs = [];

  for (let i = 0; i < STEPS; i++) {
    const seg = document.createElement('div');
    seg.className = 'step-seg';
    seg.setAttribute('aria-label', `Step ${i + 1}`);
    steppedBar.appendChild(seg);
    segs.push(seg);
  }

  function renderStep() {
    segs.forEach((s, i) => s.classList.toggle('active', i < step));
    steppedBar.setAttribute('aria-valuenow', String(step));
    stepVal.textContent = `Step ${step} of ${STEPS}`;
    stepPrevBtn.disabled = step === 0;
    stepNextBtn.disabled = step === STEPS;
  }

  stepNextBtn.addEventListener('click', () => { step = Math.min(STEPS, step + 1); renderStep(); });
  stepPrevBtn.addEventListener('click', () => { step = Math.max(0, step - 1);     renderStep(); });
  renderStep();
})();
