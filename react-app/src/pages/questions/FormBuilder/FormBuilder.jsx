import { memo } from 'react';
import { useFormBuilder, FIELD_TYPES, TEXT_TYPES, OPTIONS_TYPES } from './useFormBuilder';
import styles from './FormBuilder.module.css';

// ── Field type selector ───────────────────────────────────────────────────────

function FieldTypeGrid({ activeType, onSelect }) {
  return (
    <div className={styles.typeGrid} role="group" aria-label="Field type">
      {FIELD_TYPES.map(({ type, label, icon }) => (
        <button
          key={type}
          type="button"
          className={`${styles.typeBtn} ${activeType === type ? styles.typeBtnActive : ''}`}
          onClick={() => onSelect(type)}
          aria-pressed={activeType === type}
          title={label}
        >
          <span className={styles.typeBtnIcon} aria-hidden="true">{icon}</span>
          <span className={styles.typeBtnLabel}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Draft configuration form ──────────────────────────────────────────────────

function DraftConfig({ draft, errors, onUpdate }) {
  const showPlaceholder = TEXT_TYPES.has(draft.type);
  const showOptions     = OPTIONS_TYPES.has(draft.type);

  return (
    <div className={styles.draftConfig}>
      {/* Label — required for all types */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="draft-label">
          Label <span className={styles.required} aria-hidden="true">*</span>
        </label>
        <input
          id="draft-label"
          type="text"
          className={`${styles.input} ${errors.label ? styles.inputError : ''}`}
          value={draft.label}
          onChange={(e) => onUpdate('label', e.target.value)}
          placeholder="e.g. First Name"
          autoComplete="off"
        />
        {errors.label && (
          <span className={styles.errorMsg} role="alert">{errors.label}</span>
        )}
      </div>

      {/* Placeholder — text / number / email / textarea only */}
      {showPlaceholder && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="draft-placeholder">
            Placeholder
          </label>
          <input
            id="draft-placeholder"
            type="text"
            className={styles.input}
            value={draft.placeholder}
            onChange={(e) => onUpdate('placeholder', e.target.value)}
            placeholder="e.g. Enter your name"
            autoComplete="off"
          />
        </div>
      )}

      {/* Options — select / radio only */}
      {showOptions && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="draft-options">
            Options <span className={styles.required} aria-hidden="true">*</span>
          </label>
          <textarea
            id="draft-options"
            className={`${styles.textarea} ${errors.options ? styles.inputError : ''}`}
            value={draft.options}
            onChange={(e) => onUpdate('options', e.target.value)}
            placeholder={'One option per line:\nAdmin\nEditor\nViewer'}
            rows={4}
          />
          {errors.options && (
            <span className={styles.errorMsg} role="alert">{errors.options}</span>
          )}
          <span className={styles.hint}>One option per line</span>
        </div>
      )}

      {/* Required toggle */}
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={draft.required}
          onChange={(e) => onUpdate('required', e.target.checked)}
        />
        Required field
      </label>
    </div>
  );
}

// ── Builder panel (left column) ───────────────────────────────────────────────

function BuilderPanel({ draft, errors, onTypeSelect, onUpdate, onAdd }) {
  return (
    <aside className={styles.panel} aria-label="Field builder">
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Add Field</span>
      </div>

      <div className={styles.panelBody}>
        <div className={styles.sectionLabel}>Field Type</div>
        <FieldTypeGrid activeType={draft.type} onSelect={onTypeSelect} />

        <div className={styles.divider} />

        <DraftConfig draft={draft} errors={errors} onUpdate={onUpdate} />

        <button
          type="button"
          className={styles.addBtn}
          onClick={onAdd}
        >
          + Add to Form
        </button>
      </div>
    </aside>
  );
}

// ── FormField — polymorphic renderer ─────────────────────────────────────────
// React.memo: the preview may have many fields. Without memo, every panel
// keystroke (which updates `draft` state in the parent) re-renders all N fields.
// With memo + stable useCallback refs from the hook, only the field whose
// `value` prop changed actually re-renders.

const FormField = memo(function FormField({ field, value, onChange }) {
  const inputId = `preview-${field.id}`;

  function handleChange(e) {
    const raw = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(field.id, raw);
  }

  switch (field.type) {
    case 'text':
    case 'number':
    case 'email':
      return (
        <input
          id={inputId}
          type={field.type}
          className={styles.previewInput}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder || undefined}
          required={field.required}
        />
      );

    case 'textarea':
      return (
        <textarea
          id={inputId}
          className={styles.previewTextarea}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder || undefined}
          required={field.required}
          rows={3}
        />
      );

    case 'checkbox':
      return (
        <label className={styles.previewCheckboxLabel}>
          <input
            id={inputId}
            type="checkbox"
            className={styles.previewCheckbox}
            checked={value}
            onChange={handleChange}
            required={field.required}
          />
          {field.label}
        </label>
      );

    case 'select':
      return (
        <select
          id={inputId}
          className={styles.previewSelect}
          value={value}
          onChange={handleChange}
          required={field.required}
        >
          <option value="">— Select —</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case 'radio':
      return (
        // fieldset + legend is the correct semantic structure for radio groups.
        // It makes the group label announced by screen readers for each radio button.
        <fieldset className={styles.previewFieldset}>
          <legend className={styles.previewLegend}>{field.label}</legend>
          {field.options.map((opt) => (
            <label key={opt} className={styles.previewRadioLabel}>
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={handleChange}
                required={field.required}
                className={styles.previewRadio}
              />
              {opt}
            </label>
          ))}
        </fieldset>
      );

    default:
      return null;
  }
});

// ── FieldWrapper — field + controls ──────────────────────────────────────────
// React.memo for same reason as FormField.
// Controls (↑ ↓ ×) are revealed on hover or focus-within via CSS only — no JS.

const FieldWrapper = memo(function FieldWrapper({
  field, value, isFirst, isLast, onChange, onMoveUp, onMoveDown, onRemove,
}) {
  const isCheckbox = field.type === 'checkbox';
  const isRadio    = field.type === 'radio';
  // For radio/checkbox, label is part of the element itself — no separate <label>
  const showLabel  = !isCheckbox && !isRadio;
  const inputId    = `preview-${field.id}`;

  return (
    <div className={styles.fieldWrapper}>
      {/* Field label — not rendered for checkbox/radio (they have their own) */}
      {showLabel && (
        <label className={styles.previewLabel} htmlFor={inputId}>
          {field.label}
          {field.required && (
            <span className={styles.required} aria-hidden="true"> *</span>
          )}
        </label>
      )}

      <FormField field={field} value={value} onChange={onChange} />

      {/* Controls: opacity 0 normally, 1 on :hover / :focus-within (CSS-only) */}
      <div className={styles.fieldControls} aria-label={`Controls for ${field.label}`}>
        <button
          type="button"
          className={styles.controlBtn}
          onClick={() => onMoveUp(field.id)}
          disabled={isFirst}
          aria-label={`Move ${field.label} up`}
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          className={styles.controlBtn}
          onClick={() => onMoveDown(field.id)}
          disabled={isLast}
          aria-label={`Move ${field.label} down`}
          title="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          className={`${styles.controlBtn} ${styles.controlBtnRemove}`}
          onClick={() => onRemove(field.id)}
          aria-label={`Remove ${field.label}`}
          title="Remove field"
        >
          ×
        </button>
      </div>
    </div>
  );
});

// ── Empty form state ──────────────────────────────────────────────────────────

function EmptyForm() {
  return (
    <div className={styles.emptyForm} role="status">
      <svg
        width="48" height="48" viewBox="0 0 24 24"
        fill="none" aria-hidden="true" className={styles.emptyIcon}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity=".3"/>
        <line x1="7" y1="8"  x2="17" y2="8"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
        <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
        <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
      </svg>
      <p className={styles.emptyTitle}>No fields yet</p>
      <p className={styles.emptyHint}>Configure a field in the panel and click "Add to Form"</p>
    </div>
  );
}

// ── Submit result panel ───────────────────────────────────────────────────────

function SubmitResult({ result }) {
  return (
    <div className={styles.resultPanel} role="region" aria-label="Submitted values">
      <div className={styles.resultHeader}>
        <span className={styles.resultTitle}>Submitted Values</span>
        <span className={styles.resultBadge}>logged to console</span>
      </div>
      <pre className={styles.resultCode}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FormBuilder() {
  const {
    fields, formValues, draft, errors, submitted,
    updateDraft, setDraftType,
    addField, removeField, moveUp, moveDown,
    updateValue, handleSubmit,
  } = useFormBuilder();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Form Builder</h1>
        <p className={styles.subheading}>
          Configure fields in the left panel — they appear in the live form
          instantly. Submit to log all values as a JavaScript object.
        </p>
      </header>

      <div className={styles.workspace}>
        {/* ── Left: builder panel ── */}
        <BuilderPanel
          draft={draft}
          errors={errors}
          onTypeSelect={setDraftType}
          onUpdate={updateDraft}
          onAdd={addField}
        />

        {/* ── Right: live preview ── */}
        <div className={styles.previewPane}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>Live Preview</span>
            <span className={styles.fieldCount}>
              {fields.length} {fields.length === 1 ? 'field' : 'fields'}
            </span>
          </div>

          {fields.length === 0 ? (
            <EmptyForm />
          ) : (
            <form
              className={styles.previewForm}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className={styles.fieldList}>
                {fields.map((field, index) => (
                  <FieldWrapper
                    key={field.id}
                    field={field}
                    value={formValues[field.id] ?? ''}
                    isFirst={index === 0}
                    isLast={index === fields.length - 1}
                    onChange={updateValue}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    onRemove={removeField}
                  />
                ))}
              </div>

              <button type="submit" className={styles.submitBtn}>
                Submit Form
              </button>
            </form>
          )}

          {submitted && <SubmitResult result={submitted} />}
        </div>
      </div>
    </section>
  );
}
