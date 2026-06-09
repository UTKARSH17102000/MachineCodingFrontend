// RTK Query requires its reducer AND middleware to be registered on the store.
// The middleware enables cache lifetimes, invalidation, and polling features.

import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from './postsApi';

export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});
