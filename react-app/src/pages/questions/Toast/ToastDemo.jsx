import { useToast } from '@/hooks/useToast';
import styles from './ToastDemo.module.css';

const TYPES = ['success', 'error', 'warning', 'info'];
const POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

const MESSAGES = {
  success: 'Operation completed successfully!',
  error: 'Something went wrong. Please try again.',
  warning: 'Warning: this action cannot be undone.',
  info: 'Here is some useful information for you.',
};

export default function ToastDemo() {
  const { showToast } = useToast();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Reusable Toast</h1>
        <p className={styles.subheading}>
          Context-based notification system — portal renders outside the component tree.
        </p>
      </header>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Toast types</h2>
        <div className={styles.btnRow}>
          {TYPES.map((type) => (
            <button
              key={type}
              className={`${styles.btn} ${styles[type]}`}
              onClick={() => showToast({ message: MESSAGES[type], type })}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Positions</h2>
        <div className={styles.posGrid}>
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              className={styles.posBtn}
              onClick={() =>
                showToast({ message: `Shown at ${pos}`, type: 'info', position: pos })
              }
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Persistent (no auto-dismiss)</h2>
        <button
          className={styles.btn}
          onClick={() =>
            showToast({ message: 'I stay until you close me.', type: 'warning', duration: 0 })
          }
        >
          Show persistent toast
        </button>
      </div>
    </section>
  );
}
