# State Management Showdown — Comparison Guide

## TL;DR Decision Tree

```
Is it server state (data from an API)?
├── Yes → Do you need auto caching + invalidation?
│         ├── Yes → RTK Query  (or React Query if not using Redux)
│         └── No  → Fetch API or Axios  (simple, no extra deps)
│
└── No (it's client state — UI, user preferences, form state)
      └── Does multiple components need it?
            ├── No  → useState / useReducer  (component-local)
            └── Yes → How complex?
                        ├── Simple (theme, auth user)       → Context API
                        ├── Many async slices, large team   → Redux Toolkit
                        └── Shared state, minimal boilerplate → Zustand
```

---

## Variant Deep Dives

### 1. Fetch API
**What it is:** Native browser API. Zero dependencies, zero bundle cost.

**When to use:**
- Prototypes and learning projects
- Simple one-off API calls where bundle size matters
- Server-side rendering environments

**Gotchas:**
- Does NOT throw on 4xx/5xx — always check `res.ok` before calling `.json()`
- Must manually implement AbortController for cleanup on unmount
- No interceptors, no built-in retry, no base URL config

**Pattern:**
```js
const controller = new AbortController();
fetch(url, { signal: controller.signal })
  .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
  .then(setData)
  .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
return () => controller.abort();  // cleanup
```

---

### 2. Axios
**What it is:** HTTP client library (~14 kb gzipped). A thin wrapper around XMLHttpRequest/fetch.

**When to use:**
- Apps with auth headers needed on every request
- Centralized error handling (401 → logout, 500 → toast)
- Request/response transformation
- Environments where the Fetch API isn't available (old Node.js)

**Key feature — Interceptors:**
```js
api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});
api.interceptors.response.use(null, error => {
  if (error.response?.status === 401) logout();
  return Promise.reject(error);
});
```

**Gotchas:**
- Throws on 4xx/5xx by default (unlike fetch) — this is usually what you want
- Two cancel mechanisms: `CancelToken` (deprecated) and `AbortController` (v1+, preferred)
- Slightly larger bundle than fetch for simple cases

---

### 3. Context API
**What it is:** React's built-in context system. Combines `createContext` + `useReducer` for predictable state updates.

**When to use:**
- Global UI state that changes infrequently: theme, locale, auth user object
- Avoiding prop drilling for truly global values
- Small-to-medium apps that don't need external libraries

**Gotchas:**
- **Every context consumer re-renders** when ANY value in the context object changes
  - Fix: split large contexts into smaller ones (AuthContext, ThemeContext, PostsContext)
  - Fix: memoize components with `React.memo` or split state/dispatch into separate contexts
- Not designed for high-frequency updates (e.g. mouse position, animation frames)
- No built-in devtools beyond React DevTools

**Performance pattern:**
```js
// Split into two contexts to prevent unnecessary re-renders
const PostsStateContext   = createContext(null);  // { posts, isLoading, error }
const PostsDispatchContext = createContext(null);  // dispatch
```

---

### 4. Redux Classic
**What it is:** Original Redux pattern (pre-2019). `createStore` + string action types + thunk middleware.

**When to use:**
- **Reading and maintaining legacy codebases** — this is the pattern you'll encounter
- NOT recommended for new projects

**Defining characteristics of Classic Redux:**
- String action type constants: `const FETCH_SUCCESS = 'posts/FETCH_SUCCESS'`
- Separate action creator functions
- `applyMiddleware(thunk)` for async
- `connect()` HOC (the predecessor to `useSelector`/`useDispatch`)

**Migration path to RTK:**
1. Replace `legacy_createStore + applyMiddleware` → `configureStore`
2. Replace action type constants + action creators → `createSlice` (auto-generates both)
3. Replace thunk action creator → `createAsyncThunk`
4. Replace `connect()` HOC → `useSelector` + `useDispatch`

**Gotchas:**
- `createStore` is deprecated in Redux 5 — use `legacy_createStore` alias or migrate to RTK
- Much more boilerplate than modern alternatives
- Easy to make mistakes with immutability (no Immer protection)

---

### 5. Redux Toolkit (RTK)
**What it is:** The official, recommended way to use Redux. Bundles Immer, Thunk, and DevTools by default.

**When to use:**
- Apps with complex global client state and many interrelated slices
- Large teams where time-travel debugging and strict patterns matter
- When you're already using Redux and want to modernize

**What RTK does for you:**
- `configureStore`: adds Thunk + DevTools automatically, checks for serialization errors
- `createSlice`: generates action creators and action types from reducer functions
- `createAsyncThunk`: generates `pending`/`fulfilled`/`rejected` lifecycle actions
- Immer: write "mutating" syntax in reducers, get immutable updates for free

**Gotchas:**
- Still larger bundle than Zustand (~30 kb vs ~3 kb) for simpler use cases
- Still requires Provider wrapping
- No built-in cache TTL — data in the store stays until you clear it manually
- Overkill for simple shared state that Zustand handles in 10 lines

---

### 6. RTK Query
**What it is:** A purpose-built server-state data-fetching layer included in `@reduxjs/toolkit`. The Redux answer to React Query / SWR.

**When to use:**
- Fetching and caching REST or GraphQL API data
- When you want auto-caching, background refetching, and cache invalidation
- Already using Redux in the project

**What RTK Query does automatically:**
- **Deduplication**: multiple components calling `useGetPostsQuery()` make ONE network request
- **Caching**: responses are stored in Redux with a configurable `keepUnusedDataFor` TTL
- **Background refetching**: stale data is refreshed on window focus (opt-in)
- **Cache invalidation**: `providesTags`/`invalidatesTags` API lets mutations bust specific cache keys
- **Loading states**: `isLoading` (first fetch) vs `isFetching` (any fetch including background)

**Minimal setup:**
```js
// Define endpoint once
const postsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getPosts: builder.query({ query: () => '/posts' }),
  }),
});

// Use in components — no useEffect, no dispatch
const { data, isLoading, isError } = useGetPostsQuery();
```

**Gotchas:**
- Requires Redux Provider + the API middleware registered on the store
- Heavier conceptual overhead than React Query for teams not already using Redux
- `isLoading` vs `isFetching` distinction trips people up early

**vs. React Query / SWR:**
If your project isn't using Redux, React Query (~13 kb) has a simpler setup and is the better choice. RTK Query is the right pick when Redux is already in use.

---

### 7. Zustand
**What it is:** Lightweight (~3 kb) global state manager with a minimal API — no Provider, no reducers, no dispatch.

**When to use:**
- Shared client-side state that needs to be accessed across many components
- Replacing a Redux store that doesn't need time-travel debugging
- Small-to-medium apps where RTK feels like overkill

**What Zustand does:**
```js
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// In any component, anywhere in the tree — no Provider needed
const { count, increment } = useStore();
```

**Selective subscriptions prevent unnecessary re-renders:**
```js
// Only re-renders when `posts` changes, not when `isLoading` changes
const posts = usePostsStore((state) => state.posts);
```

**Opt-in middleware:**
```js
import { devtools, persist } from 'zustand/middleware';
const useStore = create(devtools(persist((set) => ({ ... }), { name: 'posts' })));
```

**Gotchas:**
- Store is a **module singleton** — all imports share the same instance (usually what you want)
- Not a server-state library — no built-in caching or invalidation; pair with React Query for API data
- Slices pattern needed to organize large stores:
  ```js
  const useStore = create((set) => ({
    ...createPostsSlice(set),
    ...createUserSlice(set),
  }));
  ```

---

## Bundle Size Comparison (gzipped, approximate)

| Library             | Size (gzipped) | Notes                                    |
|---------------------|----------------|------------------------------------------|
| Fetch API           | 0 kb           | Native browser API                       |
| Axios               | ~14 kb         | Separate install                         |
| Context API         | 0 kb           | Built into React                         |
| redux               | ~4 kb          | Core library                             |
| react-redux         | ~12 kb         | Bindings                                 |
| redux-thunk         | ~0.3 kb        | Middleware (included in RTK)             |
| Redux Classic total | ~16 kb         | redux + react-redux + thunk              |
| @reduxjs/toolkit    | ~18 kb         | Includes RTK Query, Immer, thunk         |
| RTK + react-redux   | ~30 kb         | Recommended modern Redux setup           |
| Zustand             | ~3 kb          | Entire library                           |

> RTK Query is included in `@reduxjs/toolkit` — no additional bundle cost beyond RTK itself.

---

## When NOT to Use Each

| Library         | Anti-pattern                                                               |
|-----------------|---------------------------------------------------------------------------|
| Context API     | High-frequency updates (mouse position, animations) — causes too many re-renders |
| Redux Classic   | Any new project — use RTK instead                                         |
| RTK             | Simple shared state (e.g., a counter, a modal open/close) — use Zustand   |
| RTK Query       | No Redux in the project — use React Query/SWR instead                     |
| Zustand         | Server state that needs caching + invalidation — pair with React Query     |
| Fetch           | Apps needing auth headers everywhere — use Axios + interceptors            |

---

## Migration Path Ladder

```
useState / useReducer
    ↓  (state needs to be shared across many components)
Context API
    ↓  (re-render performance issues or complex async flows)
Zustand
    ↓  (need time-travel debugging, strict patterns, large team)
Redux Toolkit
    ↓  (server data fetching with caching requirements)
RTK Query  (or React Query if not already using Redux)
```

---

## Summary Table

| Library       | Type          | Setup    | Boilerplate | Caching | DevTools    | Bundle  |
|---------------|---------------|----------|-------------|---------|-------------|---------|
| Fetch API     | Client state  | None     | Minimal     | Manual  | Browser     | 0 kb    |
| Axios         | Client state  | Minimal  | Minimal     | Manual  | Browser     | ~14 kb  |
| Context API   | Client state  | Built-in | Low         | Manual  | React DT    | 0 kb    |
| Redux Classic | Client state  | Manual   | High        | Manual  | Redux DT    | ~16 kb  |
| RTK           | Client state  | Easy     | Medium      | Manual  | Redux DT    | ~30 kb  |
| RTK Query     | Server state  | Easy     | Low         | Auto    | Redux DT    | ~30 kb  |
| Zustand       | Client state  | Minimal  | Minimal     | Manual  | Redux DT*   | ~3 kb   |

*Zustand DevTools require opt-in `devtools` middleware
