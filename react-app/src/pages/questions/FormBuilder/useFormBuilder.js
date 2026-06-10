import { useReducer, useState, useCallback } from 'react';

// ── Field types ───────────────────────────────────────────────────────────────
// Module-scope constant: parsed once when the module loads, never recreated.
export const FIELD_TYPES = [
  { type: 'text',     label: 'Text',     icon: 'T'  },
  { type: 'number',   label: 'Number',   icon: '#'  },
  { type: 'email',    label: 'Email',    icon: '@'  },
  { type: 'textarea', label: 'Textarea', icon: '¶'  },
  { type: 'checkbox', label: 'Checkbox', icon: '☑'  },
  { type: 'select',   label: 'Select',   icon: '▾'  },
  { type: 'radio',    label: 'Radio',    icon: '◉'  },
];

// Types that take freeform text input in the preview
export const TEXT_TYPES = new Set(['text', 'number', 'email', 'textarea']);

// Types that require an options list
export const OPTIONS_TYPES = new Set(['select', 'radio']);

// ── Default values ────────────────────────────────────────────────────────────
function defaultValue(type) {
  // checkbox is boolean; all others are string — mirrors native FormData behaviour
  return type === 'checkbox' ? false : '';
}

const INITIAL_DRAFT = {
  type: 'text',
  label: '',
  placeholder: '',
  required: false,
  options: '', // raw newline-separated string — parsed into string[] on add
};

// ── Reducer for the fields array ──────────────────────────────────────────────
// WHY useReducer over useState:
//   Four distinct mutations (add, remove, move-up, move-down) all operate on
//   the same array slice. A reducer keeps each case pure and co-located.
//   useState would require 4 separate setters for one piece of state.

function fieldsReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.field];

    case 'REMOVE':
      return state.filter((f) => f.id !== action.id);

    case 'MOVE_UP': {
      const i = state.findIndex((f) => f.id === action.id);
      if (i <= 0) return state;
      const next = [...state];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    }

    case 'MOVE_DOWN': {
      const i = state.findIndex((f) => f.id === action.id);
      if (i >= state.length - 1) return state;
      const next = [...state];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    }

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFormBuilder() {
  // fields: schema — what fields exist and how they are configured
  // formValues: data  — what the user has typed into the live preview form
  // Separating them means adding/removing a field never corrupts other values.
  const [fields, dispatch]          = useReducer(fieldsReducer, []);
  const [formValues, setFormValues] = useState({});
  const [draft, setDraft]           = useState(INITIAL_DRAFT);
  const [errors, setErrors]         = useState({});
  const [submitted, setSubmitted]   = useState(null);

  // ── Draft mutations ───────────────────────────────────────────────────────
  // useCallback: stable reference lets React.memo on child components skip
  // re-renders when FormBuilder re-renders for unrelated reasons.
  const updateDraft = useCallback((key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    // Clear per-field error as soon as the user starts correcting — responsive UX.
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  // Switching field type resets options/placeholder to avoid stale config leaking
  // from a previous type (e.g. leftover options text when switching Text → Checkbox).
  const setDraftType = useCallback((type) => {
    setDraft({ ...INITIAL_DRAFT, type });
    setErrors({});
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = useCallback(
    (d) => {
      const errs = {};
      if (!d.label.trim()) errs.label = 'Label is required';
      if (OPTIONS_TYPES.has(d.type) && !d.options.trim()) {
        errs.options = 'At least one option is required';
      }
      return errs;
    },
    [],
  );

  // ── addField ──────────────────────────────────────────────────────────────
  const addField = useCallback(() => {
    const errs = validate(draft);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Stable ID: timestamp + random suffix
    // Avoids useId() which emits colon-containing strings awkward in some contexts.
    const id = `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const field = {
      id,
      type:        draft.type,
      label:       draft.label.trim(),
      placeholder: draft.placeholder.trim(),
      required:    draft.required,
      options:     OPTIONS_TYPES.has(draft.type)
        ? draft.options.split('\n').map((o) => o.trim()).filter(Boolean)
        : [],
    };

    dispatch({ type: 'ADD', field });
    // Seed the form value for this field immediately so the controlled input
    // has a defined value from the first render (avoids uncontrolled→controlled warning).
    setFormValues((prev) => ({ ...prev, [id]: defaultValue(draft.type) }));
    setDraft(INITIAL_DRAFT);
    setErrors({});
    setSubmitted(null); // clear previous submit result when schema changes
  }, [draft, validate]);

  // ── removeField ───────────────────────────────────────────────────────────
  const removeField = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
    // Remove the corresponding value so stale data doesn't persist in state
    setFormValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSubmitted(null);
  }, []);

  // ── reorder ───────────────────────────────────────────────────────────────
  const moveUp   = useCallback((id) => dispatch({ type: 'MOVE_UP',   id }), []);
  const moveDown = useCallback((id) => dispatch({ type: 'MOVE_DOWN', id }), []);

  // ── updateValue ───────────────────────────────────────────────────────────
  // Called by controlled inputs in the live preview form.
  // useCallback + stable reference → FormField/FieldWrapper memo actually works.
  const updateValue = useCallback((id, value) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
    setSubmitted(null); // stale result cleared as user edits
  }, []);

  // ── handleSubmit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const result = {};
      fields.forEach((field) => {
        // Key by label (human-readable) — falls back to id if label somehow empty.
        result[field.label || field.id] = formValues[field.id] ?? defaultValue(field.type);
      });
      console.log('Form values:', result);
      setSubmitted(result);
    },
    [fields, formValues],
  );

  return {
    // State
    fields,
    formValues,
    draft,
    errors,
    submitted,
    // Draft mutations
    updateDraft,
    setDraftType,
    // Field mutations
    addField,
    removeField,
    moveUp,
    moveDown,
    // Preview form
    updateValue,
    handleSubmit,
  };
}
