// ZUSTAND: no Provider, no boilerplate — just import the hook
// Notice there is NO <Provider> wrapper here.
// Zustand's store is a module singleton — any component can import usePostsStore directly.
// This also means: switching away and back shows cached data instantly (store stays in memory).

import { useEffect } from 'react';
import { usePostsStore } from './usePostsStore';
import PostsList from '../../components/PostsList';

export default function ZustandVariant() {
  const { posts, isLoading, error, fetchPosts } = usePostsStore();

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
