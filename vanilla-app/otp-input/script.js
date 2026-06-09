'use strict';

const LENGTH = 6;
const CORRECT = '123456';

(function init() {
  const group   = document.getElementById('otp-group');
  const status  = document.getElementById('otp-status');
  const verify  = document.getElementById('verifyBtn');
  const reset   = document.getElementById('resetBtn');
  const inputs  = [];

  // Build inputs
  for (let i = 0; i < LENGTH; i++) {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.inputMode = 'numeric';
    inp.maxLength = 1;
    inp.className = 'otp-input';
    inp.setAttribute('aria-label', `Digit ${i + 1} of ${LENGTH}`);
    if (i === 0) inp.setAttribute('autocomplete', 'one-time-code');
    group.appendChild(inp);
    inputs.push(inp);
  }

  function getValue() { return inputs.map((i) => i.value).join(''); }
  function updateVerify() { verify.disabled = getValue().length !== LENGTH; }

  function focusNext(idx) { if (idx + 1 < LENGTH) inputs[idx + 1].focus(); }
  function focusPrev(idx) { if (idx > 0) inputs[idx - 1].focus(); }

  inputs.forEach((inp, idx) => {
    inp.addEventListener('input', (e) => {
      const val = e.data ?? inp.value;
      if (!/\d/.test(val)) { inp.value = ''; return; }
      inp.value = val.slice(-1);
      inp.classList.toggle('filled', inp.value !== '');
      updateVerify();
      focusNext(idx);
    });

    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (inp.value === '') focusPrev(idx);
        else { inp.value = ''; inp.classList.remove('filled'); updateVerify(); }
      }
      if (e.key === 'ArrowLeft')  focusPrev(idx);
      if (e.key === 'ArrowRight') focusNext(idx);
    });

    inp.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      text.split('').slice(0, LENGTH).forEach((ch, i) => {
        if (inputs[i]) { inputs[i].value = ch; inputs[i].classList.add('filled'); }
      });
      updateVerify();
      inputs[Math.min(text.length, LENGTH - 1)].focus();
    });

    inp.addEventListener('focus', () => inp.select());
  });

  verify.addEventListener('click', () => {
    const val = getValue();
    if (val === CORRECT) {
      status.textContent = '✓ Code verified successfully!';
      status.className = 'otp-status success';
      inputs.forEach((i) => { i.classList.remove('error'); i.classList.add('filled'); });
    } else {
      status.textContent = '✕ Incorrect code. Try 123456.';
      status.className = 'otp-status error';
      inputs.forEach((i) => i.classList.add('error'));
    }
  });

  reset.addEventListener('click', () => {
    inputs.forEach((i) => { i.value = ''; i.className = 'otp-input'; });
    status.textContent = '';
    status.className = 'otp-status';
    verify.disabled = true;
    inputs[0].focus();
  });

  inputs[0].focus();
})();
