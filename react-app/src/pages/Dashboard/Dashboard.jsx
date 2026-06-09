import { Link } from 'react-router-dom';
import { QUESTIONS } from './questions';
import styles from './Dashboard.module.css';

const DIFFICULTY_CLASS = {
  Easy: styles.tagEasy,
  Medium: styles.tagMedium,
  Hard: styles.tagHard,
};

export default function Dashboard() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Question Bank</h1>
        <p className={styles.subheading}>
          {QUESTIONS.length} question{QUESTIONS.length !== 1 ? 's' : ''} available
        </p>
      </header>

      <div className={styles.grid}>
        {QUESTIONS.map((q) => (
          <article key={q.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.categoryTag}>{q.category}</span>
              <span className={`${styles.difficultyTag} ${DIFFICULTY_CLASS[q.difficulty]}`}>
                {q.difficulty}
              </span>
            </div>

            <h2 className={styles.cardTitle}>{q.title}</h2>
            <p className={styles.cardDescription}>{q.description}</p>

            <Link to={q.path} className={styles.viewButton}>
              View Solution
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
