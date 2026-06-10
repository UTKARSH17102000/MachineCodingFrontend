'use strict';

// ── Constants ─────────────────────────────────────────────────────────────────
const FIELD_TYPES = [
  { type: 'text',     label: 'Text',     icon: 'T'  },
  { type: 'number',   label: 'Number',   icon: '#'  },
  { type: 'email',    label: 'Email',    icon: '@'  },
  { type: 'textarea', label: 'Textarea', icon: '¶'  },
  { type: 'checkbox', label: 'Checkbox', icon: '☑'  },
  { type: 'select',   label: 'Select',   icon: '▾'  },
  { type: 'radio',    label: 'Radio',    icon: '◉'  },
];

const OPTIONS_TYPES = new Set(['select', 'radio']);
const TEXT_TYPES    = new Set(['text', 'number', 'email', 'textarea']);

// ── State ─────────────────────────────────────────────────────────────────────
// fields: schema — what fields exist and how they are configured
// formValues: data — what the user has typed into the live preview form
// Separating them means adding/removing a field never corrupts other values.
const state = {
  fields:     [],
  formValues: {},
  submitted:  null,
};

// selectedType drives the config panel rendering — kept as module-level var
// because it controls which config inputs to show, not form data.
let selectedType = 'text';

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function genId() {
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultValue(type) {
  // checkbox is boolean; all others are string — mirrors native FormData behaviour
  return type === 'checkbox' ? false : '';
}

// ── Config reading ────────────────────────────────────────────────────────────
// Values are read FROM the DOM on "Add" — no need to mirror every keystroke
// into a parallel draft object. This avoids the complexity of keeping them in
// sync and the risk of DOM/state drift.
function getConfigValues() {
  return {
    type:        selectedType,
    label:       (document.getElementById('cfg-label')?.value ?? '').trim(),
    placeholder: (document.getElementById('cfg-placeholder')?.value ?? '').trim(),
    required:    document.getElementById('cfg-required')?.checked ?? false,
    options:     document.getElementById('cfg-options')?.value ?? '',
  };
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate(cfg) {
  const errs = {};
  if (!cfg.label) errs.label = 'Label is required';
  if (OPTIONS_TYPES.has(cfg.type) && !cfg.options.trim()) {
    errs.options = 'At least one option is required';
  }
  return errs;
}

// Targeted DOM updates for errors — no re-render of the config form.
// Errors clear as the user corrects them (responsive UX).
function showErrors(errs) {
  const labelErr = document.getElementById('cfg-label-error');
  if (labelErr) {
    labelErr.textContent = errs.label ?? '';
    document.getElementById('cfg-label')?.classList.toggle('input-error', !!errs.label);
  }
  const optErr = document.getElementById('cfg-options-error');
  if (optErr) {
    optErr.textContent = errs.options ?? '';
    document.getElementById('cfg-options')?.classList.toggle('input-error', !!errs.options);
  }
}

// ── Field mutations ───────────────────────────────────────────────────────────
function addField(field) {
  state.fields.push(field);
  state.formValues[field.id] = defaultValue(field.type);
  state.submitted = null;
}

function removeField(id) {
  state.fields = state.fields.filter((f) => f.id !== id);
  delete state.formValues[id];
  state.submitted = null;
}

function moveField(id, delta) {
  const i = state.fields.findIndex((f) => f.id === id);
  const j = i + delta;
  if (j < 0 || j >= state.fields.length) return;
  const arr = [...state.fields];
  [arr[i], arr[j]] = [arr[j], arr[i]];
  state.fields = arr;
}

// ── Render: type grid ─────────────────────────────────────────────────────────
function renderTypeGrid() {
  document.getElementById('type-grid').innerHTML = FIELD_TYPES.map(({ type, label, icon }) =>
    `<button
      class="type-btn${type === selectedType ? ' type-btn-active' : ''}"
      data-type="${type}"
      aria-pressed="${type === selectedType}"
      title="${label}"
    >
      <span class="type-icon" aria-hidden="true">${icon}</span>
      <span class="type-label">${label}</span>
    </button>`
  ).join('');
}

// ── Render: draft config form ─────────────────────────────────────────────────
// Re-renders the entire config section when the field type changes.
// After render, attaches inline error-clearing listeners so errors disappear
// as the user types — without a full re-render.
function renderDraftConfig() {
  const showPlaceholder = TEXT_TYPES.has(selectedType);
  const showOptions     = OPTIONS_TYPES.has(selectedType);

  document.getElementById('draft-config').innerHTML = `
    <div class="form-group">
      <label class="cfg-label" for="cfg-label">
        Label <span class="req-star" aria-hidden="true">*</span>
      </label>
      <input id="cfg-label" type="text" class="cfg-input"
        placeholder="e.g. First Name" autocomplete="off" />
      <span id="cfg-label-error" class="error-msg" role="alert"></span>
    </div>

    ${showPlaceholder ? `
    <div class="form-group">
      <label class="cfg-label" for="cfg-placeholder">Placeholder</label>
      <input id="cfg-placeholder" type="text" class="cfg-input"
        placeholder="e.g. Enter your name" autocomplete="off" />
    </div>` : ''}

    ${showOptions ? `
    <div class="form-group">
      <label class="cfg-label" for="cfg-options">
        Options <span class="req-star" aria-hidden="true">*</span>
      </label>
      <textarea id="cfg-options" class="cfg-textarea" rows="4"
        placeholder="One option per line:&#10;Admin&#10;Editor&#10;Viewer"></textarea>
      <span id="cfg-options-error" class="error-msg" role="alert"></span>
      <span class="hint">One option per line</span>
    </div>` : ''}

    <label class="checkbox-label">
      <input id="cfg-required" type="checkbox" class="checkbox-input" />
      Required field
    </label>
  `;

  // Clear label error as user types
  document.getElementById('cfg-label')?.addEventListener('input', () => {
    document.getElementById('cfg-label-error').textContent = '';
    document.getElementById('cfg-label').classList.remove('input-error');
  });

  // Clear options error as user types
  document.getElementById('cfg-options')?.addEventListener('input', () => {
    const el = document.getElementById('cfg-options-error');
    if (el) el.textContent = '';
    document.getElementById('cfg-options')?.classList.remove('input-error');
  });
}

// ── Render: one preview input ─────────────────────────────────────────────────
// Returns an HTML string for the field's interactive element.
// Values are seeded from state.formValues so they survive re-renders.
function previewInputHtml(field) {
  const val = state.formValues[field.id] ?? defaultValue(field.type);
  const ph  = field.placeholder ? `placeholder="${escHtml(field.placeholder)}"` : '';
  const req = field.required ? 'required' : '';
  const fid = `data-field-id="${field.id}"`;

  switch (field.type) {
    case 'text':
    case 'number':
    case 'email':
      return `<input id="pv-${field.id}" type="${field.type}"
        class="preview-input" value="${escHtml(String(val))}"
        ${ph} ${req} ${fid} />`;

    case 'textarea':
      return `<textarea id="pv-${field.id}" class="preview-textarea"
        rows="3" ${ph} ${req} ${fid}>${escHtml(String(val))}</textarea>`;

    case 'checkbox':
      // Checkbox: label wraps the input — no separate <label> needed
      return `<label class="preview-checkbox-label">
        <input type="checkbox" class="preview-checkbox"
          ${val ? 'checked' : ''} ${req} ${fid} data-cktype="checkbox" />
        ${escHtml(field.label)}
      </label>`;

    case 'select':
      return `<select id="pv-${field.id}" class="preview-select" ${req} ${fid}>
        <option value="">— Select —</option>
        ${field.options.map((opt) =>
          `<option value="${escHtml(opt)}"${val === opt ? ' selected' : ''}>${escHtml(opt)}</option>`
        ).join('')}
      </select>`;

    case 'radio':
      // <fieldset> + <legend> is the correct semantic structure for radio groups.
      // Screen readers announce the legend for every radio button in the group.
      return `<fieldset class="preview-fieldset">
        <legend class="preview-legend">${escHtml(field.label)}</legend>
        ${field.options.map((opt) =>
          `<label class="preview-radio-label">
            <input type="radio" class="preview-radio" name="${field.id}"
              value="${escHtml(opt)}" ${val === opt ? 'checked' : ''}
              ${req} ${fid} data-cktype="radio" />
            ${escHtml(opt)}
          </label>`
        ).join('')}
      </fieldset>`;

    default:
      return '';
  }
}

// ── Render: full preview panel ────────────────────────────────────────────────
// Called on: add field, remove, reorder, submit.
// NOT called on: typing in preview inputs — those update state.formValues
// directly via event listeners (attached after this render), so cursor
// position is never disrupted by a full DOM rebuild.
function renderPreview() {
  const body  = document.getElementById('preview-body');
  const count = document.getElementById('field-count');

  count.textContent = `${state.fields.length} ${state.fields.length === 1 ? 'field' : 'fields'}`;

  if (state.fields.length === 0) {
    body.innerHTML = `
      <div class="empty-form" role="status">
        <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24"
          fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"
            stroke="currentColor" stroke-width="1.5" opacity=".3"/>
          <line x1="7" y1="8"  x2="17" y2="8"  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
          <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
          <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
        </svg>
        <p class="empty-title">No fields yet</p>
        <p class="empty-hint">Configure a field in the panel and click "Add to Form"</p>
      </div>`;
    return;
  }

  const last = state.fields.length - 1;

  const fieldItems = state.fields.map((field, index) => {
    const isCheckbox = field.type === 'checkbox';
    const isRadio    = field.type === 'radio';
    const showLabel  = !isCheckbox && !isRadio;

    return `
      <div class="field-wrapper" data-id="${field.id}">
        ${showLabel
          ? `<label class="preview-label" for="pv-${field.id}">
              ${escHtml(field.label)}${field.required
                ? ' <span class="req-star" aria-hidden="true">*</span>' : ''}
             </label>`
          : ''}
        ${previewInputHtml(field)}
        <div class="field-controls">
          <button class="ctrl-btn" data-action="up" data-id="${field.id}"
            ${index === 0 ? 'disabled' : ''}
            title="Move up" aria-label="Move ${escHtml(field.label)} up">↑</button>
          <button class="ctrl-btn" data-action="down" data-id="${field.id}"
            ${index === last ? 'disabled' : ''}
            title="Move down" aria-label="Move ${escHtml(field.label)} down">↓</button>
          <button class="ctrl-btn ctrl-remove" data-action="remove" data-id="${field.id}"
            title="Remove" aria-label="Remove ${escHtml(field.label)}">×</button>
        </div>
      </div>`;
  }).join('');

  const resultHtml = state.submitted
    ? `<div class="result-panel" role="region" aria-label="Submitted values">
        <div class="result-header">
          <span class="result-title">Submitted Values</span>
          <span class="result-badge">logged to console</span>
        </div>
        <pre class="result-code">${escHtml(JSON.stringify(state.submitted, null, 2))}</pre>
       </div>`
    : '';

  body.innerHTML = `
    <form id="preview-form" class="preview-form" novalidate>
      <div class="field-list">${fieldItems}</div>
      <button type="submit" class="submit-btn">Submit Form</button>
    </form>
    ${resultHtml}`;

  // Attach input/change listeners AFTER render so typing updates state.formValues
  // without triggering another renderPreview() call — no cursor jump, no flicker.
  attachPreviewListeners();

  document.getElementById('preview-form').addEventListener('submit', handleSubmit);
}

// ── Preview input listeners ───────────────────────────────────────────────────
// Inputs: 'input' event for real-time string updates (text, number, email, textarea, select)
// Checkboxes/radios: 'change' event for boolean/string updates
// Neither triggers a re-render — only state.formValues is updated.
function attachPreviewListeners() {
  document.querySelectorAll('[data-field-id]').forEach((el) => {
    const id     = el.dataset.fieldId;
    const cktype = el.dataset.cktype; // 'checkbox' | 'radio' | undefined

    if (cktype === 'checkbox') {
      el.addEventListener('change', (e) => { state.formValues[id] = e.target.checked; });
    } else if (cktype === 'radio') {
      el.addEventListener('change', (e) => { state.formValues[id] = e.target.value; });
    } else {
      el.addEventListener('input',  (e) => { state.formValues[id] = e.target.value; });
      el.addEventListener('change', (e) => { state.formValues[id] = e.target.value; });
    }
  });
}

// ── Submit handler ────────────────────────────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const result = {};
  state.fields.forEach((field) => {
    // Key by label (human-readable); falls back to id if label is somehow empty.
    result[field.label || field.id] = state.formValues[field.id] ?? defaultValue(field.type);
  });
  console.log('Form values:', result);
  state.submitted = result;
  renderPreview(); // re-render to show the result panel
}

// ── Event delegation ──────────────────────────────────────────────────────────
// Single listener per region — no per-item handlers, no re-attachment on render.

function initEvents() {
  // Type grid: select field type
  document.getElementById('type-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    selectedType = btn.dataset.type;
    renderTypeGrid();
    renderDraftConfig();
  });

  // Add button: validate → add → re-render preview
  document.getElementById('add-btn').addEventListener('click', () => {
    const cfg  = getConfigValues();
    const errs = validate(cfg);

    if (Object.keys(errs).length > 0) {
      showErrors(errs);
      return;
    }

    const field = {
      id:          genId(),
      type:        cfg.type,
      label:       cfg.label,
      placeholder: cfg.placeholder,
      required:    cfg.required,
      options:     OPTIONS_TYPES.has(cfg.type)
        ? cfg.options.split('\n').map((o) => o.trim()).filter(Boolean)
        : [],
    };

    addField(field);
    renderPreview();

    // Reset config form so the panel is ready for the next field
    renderDraftConfig();
    document.getElementById('cfg-label')?.focus();
  });

  // Preview body: delegated click for ↑ / ↓ / × controls
  // Single listener handles all fields — no re-attachment needed after re-renders
  // because this listener lives on the stable #preview-body container.
  document.getElementById('preview-body').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;

    if (action === 'up')     { moveField(id, -1); renderPreview(); }
    if (action === 'down')   { moveField(id,  1); renderPreview(); }
    if (action === 'remove') { removeField(id);   renderPreview(); }
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  renderTypeGrid();
  renderDraftConfig();
  renderPreview();
  initEvents();
}

init();
