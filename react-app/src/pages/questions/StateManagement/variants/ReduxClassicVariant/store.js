// REDUX CLASSIC store
// legacy_createStore is the same function as the deprecated createStore — the alias
// silences the deprecation warning while keeping the classic API visible for learning.
// In new projects, use RTK's configureStore instead.

import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import postsReducer from './postsReducer';

// Module-scoped singleton — state persists as long as this module stays in memory.
export const store = createStore(postsReducer, applyMiddleware(thunk));
