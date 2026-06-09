import Toast from './Toast';
import styles from './Toast.module.css';

const POSITION_GROUPS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

export default function ToastList({ toasts, onRemove }) {
  return (
    <>
      {POSITION_GROUPS.map((pos) => {
        const group = toasts.filter((t) => t.position === pos);
        if (!group.length) return null;
        return (
          <div key={pos} className={`${styles.container} ${styles[pos.replace('-', '_')]}`} aria-live="polite" aria-atomic="false">
            {group.map((toast) => (
              <Toast key={toast.id} {...toast} onRemove={onRemove} />
            ))}
          </div>
        );
      })}
    </>
  );
}
