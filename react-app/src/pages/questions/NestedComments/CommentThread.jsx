import { useState } from 'react';
import { useComments } from './useComments';
import styles from './CommentThread.module.css';

const MAX_DEPTH = 6;

function ReplyForm({ onSubmit, onCancel }) {
  const [text, setText] = useState('');
  return (
    <form
      className={styles.replyForm}
      aria-label="Write a reply"
      onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit(text.trim()); }}
    >
      <textarea
        className={styles.textarea}
        placeholder="Write a reply…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        autoFocus
        aria-label="Reply text"
      />
      <div className={styles.replyActions}>
        <button className={styles.submitBtn} type="submit" disabled={!text.trim()}>Reply</button>
        <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function Comment({ comment, depth, ctx }) {
  const collapsed = ctx.isCollapsed(comment.id);
  const isReplyingHere = ctx.replyingTo === comment.id;

  return (
    <div className={styles.comment} style={{ '--depth': depth }}>
      {depth > 0 && <div className={styles.threadLine} aria-hidden="true" />}

      <div className={styles.commentBody} aria-label={`Comment by ${comment.author}`}>
        <div className={styles.commentHead}>
          <span className={styles.avatar} aria-hidden="true">{comment.author[0].toUpperCase()}</span>
          <span className={styles.author}>{comment.author}</span>
          <span className={styles.time}>{comment.time}</span>
          {comment.replies.length > 0 && (
            <button
              className={styles.collapseBtn}
              onClick={() => ctx.toggleCollapse(comment.id)}
              aria-expanded={!collapsed}
              aria-controls={`replies-${comment.id}`}
            >
              {collapsed ? `[+] ${comment.replies.length} replies` : '[–]'}
            </button>
          )}
        </div>

        <p className={styles.text}>{comment.text}</p>

        <div className={styles.commentActions}>
          <div className={styles.votes}>
            <button className={styles.voteBtn} onClick={() => ctx.vote(comment.id, 1)}  aria-label="Upvote">▲</button>
            <span className={styles.voteCount}>{comment.votes}</span>
            <button className={styles.voteBtn} onClick={() => ctx.vote(comment.id, -1)} aria-label="Downvote">▼</button>
          </div>
          {depth < MAX_DEPTH && (
            <button
              className={styles.replyBtn}
              onClick={() => ctx.setReplyingTo(isReplyingHere ? null : comment.id)}
              aria-label={`Reply to ${comment.author}`}
            >
              {isReplyingHere ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {isReplyingHere && (
          <ReplyForm
            onSubmit={(text) => ctx.addReply(comment.id, text)}
            onCancel={() => ctx.setReplyingTo(null)}
          />
        )}
      </div>

      {!collapsed && comment.replies.length > 0 && (
        <div id={`replies-${comment.id}`} className={styles.replies}>
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} ctx={ctx} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThread() {
  const ctx = useComments();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Nested Comments</h1>
        <p className={styles.subheading}>
          Reddit-style recursive threads — collapse, reply, vote. Depth capped at 6 levels.
        </p>
      </header>

      <div className={styles.thread}>
        {ctx.comments.map((comment) => (
          <Comment key={comment.id} comment={comment} depth={0} ctx={ctx} />
        ))}
      </div>
    </section>
  );
}
