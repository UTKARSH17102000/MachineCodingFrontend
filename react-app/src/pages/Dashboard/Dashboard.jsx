import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QUESTIONS } from './questions';
import styles from './Dashboard.module.css';

const DIFFICULTY_CLASS = {
  Easy: styles.tagEasy,
  Medium: styles.tagMedium,
  Hard: styles.tagHard,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('questions');

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Question Bank</h1>
        <p className={styles.subheading}>
          {QUESTIONS.length} question{QUESTIONS.length !== 1 ? 's' : ''} available
        </p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Dashboard sections">
        <button
          role="tab"
          aria-selected={activeTab === 'questions'}
          className={`${styles.tab} ${activeTab === 'questions' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions
          <span className={styles.tabCount}>{QUESTIONS.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'docs'}
          className={`${styles.tab} ${activeTab === 'docs' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          Interview Docs
          <span className={styles.tabCount}>{QUESTIONS.length}</span>
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className={styles.grid} role="tabpanel" aria-label="Questions">
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
      )}

      {activeTab === 'docs' && (
        <div className={styles.grid} role="tabpanel" aria-label="Interview Docs">
          {QUESTIONS.map((q) => (
            <article key={q.id} className={`${styles.card} ${styles.docCard}`}>
              <div className={styles.cardTop}>
                <span className={styles.categoryTag}>{q.category}</span>
                <span className={`${styles.difficultyTag} ${DIFFICULTY_CLASS[q.difficulty]}`}>
                  {q.difficulty}
                </span>
              </div>

              <div className={styles.docIcon} aria-hidden="true">📋</div>
              <h2 className={styles.cardTitle}>{q.title}</h2>
              <p className={styles.cardDescription}>
                Lead-level interview guide: approach, optimizations, code quality signals,
                and common pitfalls.
              </p>

              <Link to={`/docs/${q.id}`} className={styles.viewButton}>
                Interview Guide →
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
