import styles from './PostsList.module.css';

export function SkeletonCard() {
  return (
    <div aria-hidden="true" className={styles.skeleton}>
      <div className={styles.skeletonMeta}>
        <div className={styles.skeletonUserId} />
        <div className={styles.skeletonPostId} />
      </div>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonBody} />
      <div className={styles.skeletonBody} />
      <div className={styles.skeletonBodyShort} />
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className={styles.error}>
      <div className={styles.errorIcon}>!</div>
      <p className={styles.errorMessage}>{message}</p>
      <button className={styles.retryBtn} onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <li className={styles.card}>
      <div className={styles.cardMeta}>
        <span className={styles.userId}>User {post.userId}</span>
        <span className={styles.postId}>#{post.id}</span>
      </div>
      <h3 className={styles.cardTitle}>{post.title}</h3>
      <p className={styles.cardBody}>{post.body}</p>
    </li>
  );
}

export default function PostsList({ posts, isLoading, error, onRetry }) {
  if (isLoading && !posts) {
    return (
      <div aria-busy="true" aria-label="Loading posts">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (posts) {
    return (
      <ul role="list" className={styles.list}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>
    );
  }

  return null;
}
