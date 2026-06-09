import { useEffect, useRef } from 'react';
import styles from './Toast.module.css';

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function Toast({ id, message, type, duration, onRemove }) {
  const barRef = useRef(null);

  useEffect(() => {
    if (!barRef.current || duration <= 0) return;
    barRef.current.style.animationDuration = `${duration}ms`;
  }, [duration]);

  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className={styles.icon} aria-hidden="true">{ICONS[type]}</span>
      <p className={styles.message}>{message}</p>
      <button
        className={styles.close}
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
      {duration > 0 && <div ref={barRef} className={styles.progress} />}
    </div>
  );
}
