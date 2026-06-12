import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { QUESTIONS } from './questions';
import styles from './Dashboard.module.css';

const DIFFICULTY_CLASS = {
  Easy: styles.tagEasy,
  Medium: styles.tagMedium,
  Hard: styles.tagHard,
};

const FILTER_ACTIVE_CLASS = {
  All:    styles.filterBtnActiveAll,
  Easy:   styles.filterBtnActiveEasy,
  Medium: styles.filterBtnActiveMedium,
  Hard:   styles.filterBtnActiveHard,
};

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab        = searchParams.get('tab')        ?? 'questions';
  const activeDifficulty = searchParams.get('difficulty') ?? 'All';

  const setTab = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'questions') next.delete('tab');
      else next.set('tab', tab);
      return next;
    });
  };

  const setDifficulty = (difficulty) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (difficulty === 'All') next.delete('difficulty');
      else next.set('difficulty', difficulty);
      return next;
    });
  };

  const filtered = activeDifficulty === 'All'
    ? QUESTIONS
    : QUESTIONS.filter((q) => q.difficulty === activeDifficulty);

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Question Bank</h1>
        <p className={styles.subheading}>
          {activeDifficulty === 'All'
            ? `${QUESTIONS.length} questions available`
            : `${filtered.length} of ${QUESTIONS.length} questions`}
        </p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Dashboard sections">
        <button
          role="tab"
          aria-selected={activeTab === 'questions'}
          className={`${styles.tab} ${activeTab === 'questions' ? styles.tabActive : ''}`}
          onClick={() => setTab('questions')}
        >
          Questions
          <span className={styles.tabCount}>{filtered.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'docs'}
          className={`${styles.tab} ${activeTab === 'docs' ? styles.tabActive : ''}`}
          onClick={() => setTab('docs')}
        >
          Interview Docs
          <span className={styles.tabCount}>{filtered.length}</span>
        </button>
      </div>

      <div className={styles.filterBar} role="group" aria-label="Filter by difficulty">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            aria-pressed={activeDifficulty === d}
            className={`${styles.filterBtn} ${activeDifficulty === d ? `${styles.filterBtnActive} ${FILTER_ACTIVE_CLASS[d]}` : ''}`}
            onClick={() => setDifficulty(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {activeTab === 'questions' && (
        <div role="tabpanel" aria-label="Questions">
          {filtered.length === 0 ? (
            <p className={styles.emptyState}>No questions match the selected difficulty.</p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((q) => (
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
        </div>
      )}

      {activeTab === 'docs' && (
        <div role="tabpanel" aria-label="Interview Docs">
          {filtered.length === 0 ? (
            <p className={styles.emptyState}>No docs match the selected difficulty.</p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((q) => (
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
        </div>
      )}
    </section>
  );
}
