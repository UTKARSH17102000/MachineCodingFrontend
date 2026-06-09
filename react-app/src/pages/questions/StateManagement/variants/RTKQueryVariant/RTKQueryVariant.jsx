// RTK QUERY: useGetPostsQuery hook
// Key difference from all other variants:
//  - NO useEffect — the query hook triggers automatically on mount
//  - NO dispatch — data fetching is declarative
//  - Switch away and back: data returns from cache instantly (isFetching, not isLoading)
//  - Multiple components using the same query? Only ONE network request is made (deduplication)

import { Provider } from 'react-redux';
import { store } from './store';
import { useGetPostsQuery } from './postsApi';
import PostsList from '../../components/PostsList';

function PostsRTKQuery() {
  const { data: posts, isLoading, isError, error, refetch } = useGetPostsQuery();

  // isLoading: true only on first load (no cached data)
  // isFetching: true on first load AND background refetches
  // This distinction lets us show cached data while silently updating in the background
  return (
    <PostsList
      posts={posts ?? null}
      isLoading={isLoading}
      error={isError ? (error?.error ?? 'Failed to fetch') : null}
      onRetry={refetch}
    />
  );
}

export default function RTKQueryVariant() {
  return (
    <Provider store={store}>
      <PostsRTKQuery />
    </Provider>
  );
}
