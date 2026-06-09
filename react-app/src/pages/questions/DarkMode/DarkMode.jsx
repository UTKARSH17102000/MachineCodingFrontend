import { useTheme } from '@/hooks/useTheme';
import styles from './DarkMode.module.css';

const FEATURES = [
  { icon: '🎨', label: 'CSS custom properties', desc: 'All colors are tokens on :root — one attribute flip switches the entire palette.' },
  { icon: '💾', label: 'localStorage persistence', desc: 'Theme preference survives page reload and browser restarts.' },
  { icon: '🖥', label: 'System preference', desc: 'Reads prefers-color-scheme on first visit with no stored preference.' },
  { icon: '⚡', label: 'Zero flash', desc: 'Theme is applied before first paint via synchronous localStorage read in useTheme.' },
];

export default function DarkMode() {
  const { theme, toggle } = useTheme();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Dark Mode</h1>
        <p className={styles.subheading}>
          Global theme toggle — currently in <strong>{theme}</strong> mode
        </p>
      </header>

      <div className={styles.toggleSection}>
        <p className={styles.label}>Toggle theme</p>
        <button
          className={styles.toggleBtn}
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className={styles.track} data-active={theme === 'light'}>
            <span className={styles.thumb}>{theme === 'dark' ? '☾' : '☀'}</span>
          </span>
          <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
        </button>
        <p className={styles.hint}>Also available via the ☀/☾ button in the header on every page.</p>
      </div>

      <div className={styles.grid}>
        {FEATURES.map((f) => (
          <article key={f.label} className={styles.card}>
            <span className={styles.cardIcon}>{f.icon}</span>
            <h2 className={styles.cardTitle}>{f.label}</h2>
            <p className={styles.cardDesc}>{f.desc}</p>
          </article>
        ))}
      </div>

      <div className={styles.preview}>
        <h2 className={styles.previewTitle}>Palette preview</h2>
        <div className={styles.swatches}>
          {[
            ['Background', 'var(--color-bg)'],
            ['Surface', 'var(--color-surface)'],
            ['Border', 'var(--color-border)'],
            ['Primary', 'var(--color-primary)'],
            ['Text', 'var(--color-text)'],
            ['Muted', 'var(--color-text-muted)'],
          ].map(([name, color]) => (
            <div key={name} className={styles.swatch}>
              <div className={styles.swatchColor} style={{ background: color }} />
              <span className={styles.swatchLabel}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
