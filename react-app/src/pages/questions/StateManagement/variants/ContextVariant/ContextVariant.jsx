import { useEffect } from 'react';
import { PostsProvider, usePostsContext } from './PostsContext';
import PostsList from '../../components/PostsList';

function ContextConsumer() {
  const { posts, isLoading, error, fetchPosts } = usePostsContext();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <PostsList
      posts={posts}
      isLoading={isLoading}
      error={error}
      onRetry={fetchPosts}
    />
  );
}

// Provider wraps only this subtree — state is isolated from other variants
export default function ContextVariant() {
  return (
    <PostsProvider>
      <ContextConsumer />
    </PostsProvider>
  );
}
