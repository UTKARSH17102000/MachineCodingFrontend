// REDUX CLASSIC: connect() HOC pattern
// connect() is the pre-hooks way to wire Redux state into components.
// mapStateToProps: subscribes to store, maps state → props
// mapDispatchToProps: wraps dispatch calls → props
// In modern Redux, useSelector + useDispatch replace connect entirely.

import { useEffect } from 'react';
import { Provider, connect } from 'react-redux';
import { store } from './store';
import { fetchPostsThunk } from './postsActions';
import PostsList from '../../components/PostsList';

const mapStateToProps = (state) => ({
  posts: state.posts,
  isLoading: state.isLoading,
  error: state.error,
});

const mapDispatchToProps = (dispatch) => ({
  fetchPosts: () => dispatch(fetchPostsThunk()),
});

// Inner component receives Redux state as regular props — no hooks, no context
function PostsConnected({ posts, isLoading, error, fetchPosts }) {
  useEffect(() => {
    fetchPosts();
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

const PostsContainer = connect(mapStateToProps, mapDispatchToProps)(PostsConnected);

// Each variant owns its own Provider + store for complete isolation
export default function ReduxClassicVariant() {
  return (
    <Provider store={store}>
      <PostsContainer />
    </Provider>
  );
}
