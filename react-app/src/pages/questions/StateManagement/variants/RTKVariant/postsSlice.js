// REDUX TOOLKIT: createSlice + createAsyncThunk
// createAsyncThunk auto-generates pending/fulfilled/rejected action types.
// createSlice uses Immer under the hood — you can "mutate" state directly in reducers.
// No separate action type constants or action creator files needed.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=20');
    if (!res.ok) return rejectWithValue(`HTTP ${res.status}`);
    return res.json();
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: { posts: null, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export default postsSlice.reducer;
