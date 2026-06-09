import styles from './ProgressBar.module.css';

export function ProgressBar({ value = 0, max = 100, variant = 'determinate', steps = 5, label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  if (variant === 'indeterminate') {
    return (
      <div className={styles.wrapper}>
        {label && <span className={styles.label}>{label}</span>}
        <div
          role="progressbar"
          aria-label={label || 'Loading'}
          className={`${styles.track} ${styles.indeterminateTrack}`}
        >
          <div className={styles.indeterminateBar} />
        </div>
      </div>
    );
  }

  if (variant === 'stepped') {
    return (
      <div className={styles.wrapper}>
        {label && <span className={styles.label}>{label}</span>}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={steps}
          aria-label={label || `Step ${value} of ${steps}`}
          className={styles.steppedTrack}
        >
          {Array.from({ length: steps }, (_, i) => (
            <div
              key={i}
              className={`${styles.step} ${i < value ? styles.stepActive : ''}`}
            />
          ))}
        </div>
        <span className={styles.stepMeta}>{value} / {steps}</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          <span className={styles.pct}>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `${Math.round(pct)}% complete`}
        className={styles.track}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
