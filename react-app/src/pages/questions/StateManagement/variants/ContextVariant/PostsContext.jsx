// CONTEXT API variant: createContext + useReducer
// Mirrors the ToastContext pattern already in this project (src/contexts/ToastContext.jsx).
// Best for: shared UI state (theme, auth user) that changes infrequently.
// Gotcha: every context consumer re-renders when ANY value in the context object changes.

import { createContext, useContext, useReducer, useCallback } from 'react';

const PostsContext = createContext(null);

const INITIAL_STATE = { posts: null, isLoading: false, error: null };

function postsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { posts: action.payload, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export function PostsProvider({ children }) {
  const [state, dispatch] = useReducer(postsReducer, INITIAL_STATE);

  const fetchPosts = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await fetch(
        'https://jsonplaceholder.typicode.com/posts?_limit=20'
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    }
  }, []);

  return (
    <PostsContext.Provider value={{ ...state, fetchPosts }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsContext() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePostsContext must be used inside PostsProvider');
  return ctx;
}
