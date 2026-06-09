import { useProgressTimer } from './useProgressTimer';
import styles from './ParallelProgressBar.module.css';

const BARS = [
  { id: 1, label: 'Image assets',    duration: 3000, color: '#6c63ff' },
  { id: 2, label: 'CSS bundle',      duration: 1800, color: '#4ade80' },
  { id: 3, label: 'JavaScript',      duration: 5500, color: '#facc15' },
  { id: 4, label: 'API prefetch',    duration: 2400, color: '#f87171' },
  { id: 5, label: 'Web fonts',       duration: 4200, color: '#38bdf8' },
];

function SingleBar({ label, duration, color }) {
  const { progress, isRunning, start, pause, reset } = useProgressTimer(duration);
  const pct = Math.round(progress);

  return (
    <div className={styles.bar}>
      <div className={styles.barMeta}>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barPct} style={{ color }}>{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={styles.track}
      >
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className={styles.barControls}>
        <button className={styles.ctrlBtn} onClick={start}  disabled={isRunning || pct >= 100} aria-label={`Start ${label}`}>▶</button>
        <button className={styles.ctrlBtn} onClick={pause}  disabled={!isRunning}               aria-label={`Pause ${label}`}>⏸</button>
        <button className={styles.ctrlBtn} onClick={reset}                                      aria-label={`Reset ${label}`}>↺</button>
      </div>
    </div>
  );
}

export default function ParallelProgressBar() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Parallel Progress Bar</h1>
        <p className={styles.subheading}>
          Each bar has independent state using requestAnimationFrame — smooth 60fps, accurate pause/resume.
        </p>
      </header>
      <div className={styles.bars}>
        {BARS.map((b) => <SingleBar key={b.id} {...b} />)}
      </div>
    </section>
  );
}
