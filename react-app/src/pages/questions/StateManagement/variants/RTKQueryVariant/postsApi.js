// RTK QUERY: createApi + fetchBaseQuery
// RTK Query is a purpose-built data-fetching layer included in @reduxjs/toolkit.
// It handles: caching, deduplication, background refetching, and loading/error states automatically.
// No useEffect or dispatch needed in components — the hook does everything.

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com' }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts?_limit=20',
      // keepUnusedDataFor: 60,  // cache data for 60s after last subscriber unmounts
    }),
  }),
});

export const { useGetPostsQuery } = postsApi;
