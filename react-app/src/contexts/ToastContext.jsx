import { createContext, useContext, useReducer, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ToastList from '@/components/Toast/ToastList';

const ToastContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const showToast = useCallback(({ message, type = 'info', duration = 3500, position = 'bottom-right' }) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', toast: { id, message, type, duration, position } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {createPortal(<ToastList toasts={toasts} onRemove={removeToast} />, document.body)}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be inside ToastProvider');
  return ctx;
}
