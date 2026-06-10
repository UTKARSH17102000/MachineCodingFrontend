import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QUESTIONS } from '@/pages/Dashboard/questions';
import styles from './DocViewer.module.css';

export default function DocViewer() {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('loading');

  const question = QUESTIONS.find((q) => q.id === id);

  useEffect(() => {
    setStatus('loading');
    import(`../../docs/${id}.md?raw`)
      .then((mod) => { setContent(mod.default); setStatus('ok'); })
      .catch(() => setStatus('error'));
  }, [id]);

  const components = {
    code({ node, inline, className, children, ...props }) {
      const lang = /language-(\w+)/.exec(className || '')?.[1];
      return !inline && lang ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={lang}
          PreTag="div"
          customStyle={{ borderRadius: 'var(--radius-md)', margin: 'var(--space-4) 0', fontSize: '0.875rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={styles.inlineCode} {...props}>{children}</code>
      );
    },
  };

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>← Back to Dashboard</Link>

      {status === 'loading' && (
        <div className={styles.state} role="status">Loading guide…</div>
      )}

      {status === 'error' && (
        <div className={styles.state} role="alert">
          Interview guide not found for <strong>"{id}"</strong>.
        </div>
      )}

      {status === 'ok' && (
        <article className={styles.article}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {content}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
}
