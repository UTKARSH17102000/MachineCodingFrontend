import { useOTPInput } from './useOTPInput';
import styles from './OTPInput.module.css';

const OTP_LENGTH = 6;

export default function OTPInput() {
  const { values, refs, handleChange, handleKeyDown, handlePaste, reset } = useOTPInput(OTP_LENGTH);
  const isComplete = values.every(Boolean);
  const otp = values.join('');

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>OTP Input</h1>
        <p className={styles.subheading}>
          Auto-advances on digit entry. Backspace moves back. Paste fills all fields.
        </p>
      </header>

      <div className={styles.demo}>
        <div
          role="group"
          aria-label={`Enter ${OTP_LENGTH}-digit OTP`}
          className={styles.inputGroup}
          onPaste={handlePaste}
        >
          {values.map((val, idx) => (
            <input
              key={idx}
              ref={(el) => { refs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={val}
              aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
              autoComplete={idx === 0 ? 'one-time-code' : 'off'}
              className={`${styles.input} ${val ? styles.filled : ''} ${isComplete ? styles.complete : ''}`}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        {isComplete && (
          <p className={styles.result} role="status" aria-live="polite">
            OTP entered: <strong>{otp}</strong>
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.verifyBtn} disabled={!isComplete}>
            {isComplete ? 'Verify OTP' : `${values.filter(Boolean).length} / ${OTP_LENGTH} digits`}
          </button>
          <button className={styles.resetBtn} onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
