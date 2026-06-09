import { useState, useRef } from 'react';
import { ProgressBar } from './ProgressBar';
import styles from './ProgressBar.module.css';

export default function ProgressBarDemo() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const timerRef = useRef(null);

  function startProgress() {
    if (timerRef.current) return;
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(timerRef.current); timerRef.current = null; return 100; }
        return p + 2;
      });
    }, 60);
  }

  function reset() {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setProgress(0);
    setStep(0);
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Progress Bar</h1>
        <p className={styles.subheading}>
          Determinate, indeterminate, and stepped variants with ARIA progressbar role.
        </p>
      </header>

      <div className={styles.demo}>
        <div className={styles.demoSection}>
          <h2 className={styles.demoTitle}>Determinate</h2>
          <ProgressBar value={progress} label="Upload progress" />
          <div className={styles.demoActions}>
            <button className={styles.btn} onClick={startProgress}>Start</button>
            <button className={styles.btnSecondary} onClick={reset}>Reset</button>
          </div>
        </div>

        <div className={styles.demoSection}>
          <h2 className={styles.demoTitle}>Indeterminate</h2>
          <ProgressBar variant="indeterminate" label="Processing…" />
        </div>

        <div className={styles.demoSection}>
          <h2 className={styles.demoTitle}>Stepped (5 steps)</h2>
          <ProgressBar variant="stepped" value={step} steps={5} label="Onboarding progress" />
          <div className={styles.demoActions}>
            <button className={styles.btnSecondary} onClick={() => setStep((s) => Math.max(0, s - 1))}>← Back</button>
            <button className={styles.btn} onClick={() => setStep((s) => Math.min(5, s + 1))}>Next →</button>
          </div>
        </div>

        <div className={styles.demoSection}>
          <h2 className={styles.demoTitle}>Color variants</h2>
          <ProgressBar value={25} label="Low (25%)" />
          <ProgressBar value={55} label="Mid (55%)" />
          <ProgressBar value={80} label="High (80%)" />
          <ProgressBar value={100} label="Complete (100%)" />
        </div>
      </div>
    </section>
  );
}
