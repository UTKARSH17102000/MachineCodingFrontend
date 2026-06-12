import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QUESTIONS } from '@/pages/Dashboard/questions';
import styles from './CodeViewer.module.css';

// All question source files bundled as raw strings at build time.
// Works in production (Vercel) — no runtime file I/O needed.
const RAW_FILES = import.meta.glob(
  '/src/pages/questions/**/*.{jsx,js,css}',
  { as: 'raw', eager: true },
);

const EXT_LANG = { jsx: 'jsx', js: 'javascript', css: 'css' };

const EXT_CLASS = {
  jsx: styles.extJsx,
  js:  styles.extJs,
  css: styles.extCss,
};

export default function CodeViewer() {
  const { id } = useParams();
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied]       = useState(false);

  const question = QUESTIONS.find((q) => q.id === id);

  if (!question) {
    return (
      <div className={styles.page}>
        <Link to="/?tab=code" className={styles.back}>← Back to Solutions</Link>
        <p className={styles.notFound}>Question "{id}" not found.</p>
      </div>
    );
  }

  const files = question.files.map((relPath) => {
    const filename = relPath.split('/').pop();
    const ext      = filename.split('.').pop();
    return {
      relPath,
      filename,
      ext,
      content: RAW_FILES[`/src/pages/questions/${relPath}`] ?? '// File not found',
    };
  });

  const active = files[activeIdx];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <Link to="/?tab=code" className={styles.back}>← Back to Solutions</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{question.title}</h1>
        <div className={styles.meta}>
          <span className={styles.categoryTag}>{question.category}</span>
          <span className={`${styles.difficultyTag} ${styles[`tag${question.difficulty}`]}`}>
            {question.difficulty}
          </span>
        </div>
      </header>

      <div className={styles.viewer}>
        <div className={styles.fileBar}>
          <div
            className={styles.fileTabs}
            role="tablist"
            aria-label="Source files"
          >
            {files.map((f, i) => (
              <button
                key={f.relPath}
                role="tab"
                aria-selected={i === activeIdx}
                className={`${styles.fileTab} ${i === activeIdx ? styles.fileTabActive : ''}`}
                onClick={() => { setActiveIdx(i); setCopied(false); }}
              >
                <span className={`${styles.extBadge} ${EXT_CLASS[f.ext] ?? ''}`}>
                  {f.ext}
                </span>
                {f.filename}
              </button>
            ))}
          </div>

          <button
            className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
            onClick={handleCopy}
            aria-label="Copy file contents"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div role="tabpanel">
          <SyntaxHighlighter
            language={EXT_LANG[active.ext] ?? 'text'}
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '0.875rem',
              minHeight: '60vh',
              maxHeight: '75vh',
              overflow: 'auto',
            }}
          >
            {active.content}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
