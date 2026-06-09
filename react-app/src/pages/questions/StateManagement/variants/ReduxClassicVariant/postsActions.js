// REDUX CLASSIC: thunk action creator
// A thunk is a function that returns a function (dispatch) => void instead of a plain action object.
// redux-thunk middleware intercepts these and calls them with dispatch.

import { POSTS_FETCH_START, POSTS_FETCH_SUCCESS, POSTS_FETCH_ERROR } from './postsReducer';

export const fetchPostsThunk = () => async (dispatch) => {
  dispatch({ type: POSTS_FETCH_START });
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=20');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    dispatch({ type: POSTS_FETCH_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: POSTS_FETCH_ERROR, payload: err.message });
  }
};
