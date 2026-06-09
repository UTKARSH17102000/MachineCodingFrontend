// REDUX CLASSIC: action type string constants + switch-case reducer
// This is the pre-2019 Redux pattern you'll find in legacy codebases.
// In new projects, use Redux Toolkit's createSlice instead.

export const POSTS_FETCH_START   = 'posts/FETCH_START';
export const POSTS_FETCH_SUCCESS = 'posts/FETCH_SUCCESS';
export const POSTS_FETCH_ERROR   = 'posts/FETCH_ERROR';

const initialState = { posts: null, isLoading: false, error: null };

export default function postsReducer(state = initialState, action) {
  switch (action.type) {
    case POSTS_FETCH_START:
      return { ...state, isLoading: true, error: null };
    case POSTS_FETCH_SUCCESS:
      return { posts: action.payload, isLoading: false, error: null };
    case POSTS_FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}
