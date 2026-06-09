// RTK configureStore automatically:
//  - Adds redux-thunk middleware
//  - Wires Redux DevTools Extension (open browser devtools to inspect)
//  - Enables serializability checks in development

import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';

export const store = configureStore({
  reducer: { posts: postsReducer },
});
