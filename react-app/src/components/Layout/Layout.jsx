import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import styles from './Layout.module.css';

export default function Layout() {
  const { theme, toggle } = useTheme();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand}>
          Machine Coding
        </NavLink>
        <span className={styles.subtitle}>Frontend Interview Prep</span>
        <button
          className={styles.themeToggle}
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>Built for interview practice</p>
      </footer>
    </div>
  );
}
