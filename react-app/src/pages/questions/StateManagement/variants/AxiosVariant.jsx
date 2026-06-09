// AXIOS variant: axios instance with interceptors + CancelToken
// Key points:
//  1. axios.create() gives an isolated instance — real apps use this for base URL + auth headers
//  2. Interceptors are the centralized place for auth tokens, error logging, and retry logic
//  3. axios auto-throws on 4xx/5xx — no res.ok check needed (unlike native fetch)
//  4. CancelToken handles cleanup on unmount (axios v1 also supports AbortController)

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PostsList from '../components/PostsList';

// Module-scoped instance — created once, not recreated on renders
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

// Request interceptor: add auth headers, log requests, etc.
api.interceptors.request.use((config) => {
  // e.g. config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});

// Response interceptor: centralized error handling, token refresh, etc.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // e.g. if (error.response?.status === 401) logout();
    return Promise.reject(error);
  }
);

export default function AxiosVariant() {
  const [posts, setPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(() => {
    const source = axios.CancelToken.source();

    setIsLoading(true);
    setError(null);
    setPosts(null);

    api
      .get('/posts', { params: { _limit: 20 }, cancelToken: source.token })
      .then(({ data }) => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => source.cancel('Component unmounted');
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
