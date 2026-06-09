// FETCH variant: native fetch API + useState + AbortController
// Key points:
//  1. AbortController cancels in-flight request on unmount (React StrictMode safe)
//  2. useCallback wraps fetchPosts so it's stable for useEffect deps and onRetry
//  3. res.ok check is essential — fetch does NOT throw on 4xx/5xx
//  4. 'AbortError' guard prevents setting error state during intentional cleanup

import { useState, useEffect, useCallback } from 'react';
import PostsList from '../components/PostsList';

const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=20';

export default function FetchVariant() {
  const [posts, setPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);
    setPosts(null);

    fetch(API_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = fetchPosts();
    return cleanup;
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
