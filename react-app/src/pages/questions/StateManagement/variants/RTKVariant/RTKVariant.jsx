// REDUX TOOLKIT: useSelector + useDispatch hooks
// Replaces the connect() HOC — much less boilerplate, works with functional components.
// useSelector re-renders the component only when the selected slice changes.

import { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store';
import { fetchPosts } from './postsSlice';
import PostsList from '../../components/PostsList';

function PostsRTK() {
  const dispatch = useDispatch();
  const { posts, isLoading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <PostsList
      posts={posts}
      isLoading={isLoading}
      error={error}
      onRetry={() => dispatch(fetchPosts())}
    />
  );
}

export default function RTKVariant() {
  return (
    <Provider store={store}>
      <PostsRTK />
    </Provider>
  );
}
