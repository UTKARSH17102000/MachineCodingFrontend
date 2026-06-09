// ZUSTAND: create() store with async action
// Key differences from Redux:
//  - No Provider wrapper needed — the store is a hook, accessible anywhere
//  - No action types, reducers, or dispatch — just set() directly
//  - Module singleton: all components importing usePostsStore share the same state
//  - Tiny (~3 kb gzipped) vs RTK (~30 kb)
//
// To add devtools: import { devtools } from 'zustand/middleware'
//                  export const usePostsStore = create(devtools((set) => ({ ... })));

import { create } from 'zustand';

export const usePostsStore = create((set) => ({
  posts: null,
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=20');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({ posts: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
