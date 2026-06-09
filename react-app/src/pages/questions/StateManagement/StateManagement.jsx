import { lazy, Suspense, useState } from 'react';
import { SkeletonCard } from './components/PostsList';
import styles from './StateManagement.module.css';

// All variants are lazy-loaded — their JS chunks (+ Redux/Zustand bundles)
// only download when a variant is first selected, not on page load.
const FetchVariant        = lazy(() => import('./variants/FetchVariant'));
const AxiosVariant        = lazy(() => import('./variants/AxiosVariant'));
const ContextVariant      = lazy(() => import('./variants/ContextVariant/ContextVariant'));
const ReduxClassicVariant = lazy(() => import('./variants/ReduxClassicVariant/ReduxClassicVariant'));
const RTKVariant          = lazy(() => import('./variants/RTKVariant/RTKVariant'));
const RTKQueryVariant     = lazy(() => import('./variants/RTKQueryVariant/RTKQueryVariant'));
const ZustandVariant      = lazy(() => import('./variants/ZustandVariant/ZustandVariant'));

const VARIANT_COMPONENTS = {
  fetch:          FetchVariant,
  axios:          AxiosVariant,
  context:        ContextVariant,
  'redux-classic': ReduxClassicVariant,
  rtk:            RTKVariant,
  'rtk-query':    RTKQueryVariant,
  zustand:        ZustandVariant,
};

const VARIANTS = [
  { id: 'fetch',          label: 'Fetch API',      badge: 'native',    color: '#4ade80' },
  { id: 'axios',          label: 'Axios',           badge: 'axios',     color: '#f59e0b' },
  { id: 'context',        label: 'Context API',     badge: 'react',     color: '#38bdf8' },
  { id: 'redux-classic',  label: 'Redux Classic',   badge: 'redux',     color: '#9333ea' },
  { id: 'rtk',            label: 'Redux Toolkit',   badge: 'RTK',       color: '#a855f7' },
  { id: 'rtk-query',      label: 'RTK Query',       badge: 'RTK Query', color: '#c084fc' },
  { id: 'zustand',        label: 'Zustand',         badge: 'zustand',   color: '#fb923c' },
];

const TABLE_DATA = [
  {
    library: 'Fetch API',
    boilerplate: 'Minimal',
    bundleKb: '0 kb',
    caching: 'Manual',
    devtools: 'Browser only',
    curve: 'Low',
    bestFor: 'One-off fetches, learning React, no extra deps',
  },
  {
    library: 'Axios',
    boilerplate: 'Minimal',
    bundleKb: '~14 kb',
    caching: 'Manual',
    devtools: 'Browser only',
    curve: 'Low',
    bestFor: 'Apps needing interceptors, auth tokens, base URL config',
  },
  {
    library: 'Context API',
    boilerplate: 'Low',
    bundleKb: '0 kb (built-in)',
    caching: 'Manual',
    devtools: 'React DevTools',
    curve: 'Low',
    bestFor: 'Shared UI state (theme, auth user) — not high-freq updates',
  },
  {
    library: 'Redux Classic',
    boilerplate: 'High',
    bundleKb: '~16 kb',
    caching: 'Manual',
    devtools: 'Redux DevTools (time-travel)',
    curve: 'High',
    bestFor: 'Reading legacy codebases — not recommended for new projects',
  },
  {
    library: 'Redux Toolkit',
    boilerplate: 'Medium',
    bundleKb: '~30 kb',
    caching: 'Manual',
    devtools: 'Redux DevTools (time-travel)',
    curve: 'Medium',
    bestFor: 'Complex global client state with many slices and sync reducers',
  },
  {
    library: 'RTK Query',
    boilerplate: 'Low',
    bundleKb: '~30 kb (part of RTK)',
    caching: 'Auto (TTL + tags)',
    devtools: 'Redux DevTools + RTK Query panel',
    curve: 'Medium',
    bestFor: 'Server state — REST/GraphQL with auto caching + invalidation',
  },
  {
    library: 'Zustand',
    boilerplate: 'Minimal',
    bundleKb: '~3 kb',
    caching: 'Manual',
    devtools: 'Redux DevTools (opt-in)',
    curve: 'Very Low',
    bestFor: 'Shared client state — simpler, lighter Redux replacement',
  },
];

const COLUMNS = [
  { key: 'library',     label: 'Library' },
  { key: 'boilerplate', label: 'Boilerplate' },
  { key: 'bundleKb',    label: 'Bundle Size' },
  { key: 'caching',     label: 'Caching' },
  { key: 'devtools',    label: 'DevTools' },
  { key: 'curve',       label: 'Learning Curve' },
  { key: 'bestFor',     label: 'Best Use Case' },
];

const PROS_CONS_DATA = [
  {
    library: 'Fetch API',
    color: '#4ade80',
    badge: 'native',
    pros: [
      'Zero dependencies, zero bundle cost',
      'Built into every browser — no install needed',
      'Full control over request lifecycle',
      'Works in Service Workers and Web Workers',
    ],
    cons: [
      'Does not throw on 4xx/5xx — must check res.ok manually',
      'No interceptors or base URL config',
      'Verbose error handling and cleanup boilerplate',
      'No built-in retry, timeout, or request deduplication',
    ],
    when: 'Simple one-off fetches, scripts, or projects where bundle size is critical. Good starting point when learning React data fetching.',
  },
  {
    library: 'Axios',
    color: '#f59e0b',
    badge: 'axios',
    pros: [
      'Interceptors for centralized auth, logging, and error handling',
      'Throws automatically on 4xx/5xx — no res.ok boilerplate',
      'Base URL and default headers via axios.create()',
      'Automatic JSON serialization/deserialization',
    ],
    cons: [
      '~14 kb added to bundle (vs 0 kb for fetch)',
      'CancelToken is deprecated — migration to AbortController needed',
      'Slight abstraction overhead for very simple use cases',
      'Parallel with fetch features added in modern browsers',
    ],
    when: 'Any app that makes multiple API calls and needs auth headers on every request, centralized error handling, or a configured base URL. The go-to in most production codebases.',
  },
  {
    library: 'Context API',
    color: '#38bdf8',
    badge: 'react',
    pros: [
      'Built into React — no extra dependencies',
      'Simple mental model: Provider → Consumer via hook',
      'Perfect for infrequently changing global values',
      'Easy to test with wrapper utilities',
    ],
    cons: [
      'All consumers re-render when any context value changes',
      'No built-in performance optimization (needs memo or split contexts)',
      'Async actions require manual dispatch + try/catch in the provider',
      'Can become messy with deeply nested providers (Provider Hell)',
    ],
    when: 'Global UI state that changes rarely: theme, locale, authenticated user, feature flags. Avoid for frequently updated state (form inputs, animation) — use Zustand or RTK instead.',
  },
  {
    library: 'Redux Classic',
    color: '#9333ea',
    badge: 'redux',
    pros: [
      'Full time-travel debugging via Redux DevTools',
      'Strict unidirectional data flow — predictable state changes',
      'Enormous ecosystem — middleware, adapters, tutorials',
      'battle-tested in large codebases since 2015',
    ],
    cons: [
      'Massive boilerplate: action types, creators, reducers, connect HOC',
      'createStore is deprecated in Redux 5',
      'Easy to accidentally mutate state (no Immer protection)',
      'High learning curve for beginners',
    ],
    when: 'Maintain or understand existing legacy codebases. Do not use for new projects — Redux Toolkit is the recommended replacement with 80% less boilerplate.',
  },
  {
    library: 'Redux Toolkit',
    color: '#a855f7',
    badge: 'RTK',
    pros: [
      'Drastically less boilerplate than classic Redux',
      'Immer built-in — write "mutating" reducer logic safely',
      'createAsyncThunk handles pending/fulfilled/rejected automatically',
      'Redux DevTools wired automatically via configureStore',
    ],
    cons: [
      '~30 kb bundle (react-redux + RTK) — heavier than Zustand',
      'Still requires Provider wrapping',
      'No built-in cache TTL or invalidation (use RTK Query for server state)',
      'Overkill for simple shared client state',
    ],
    when: 'Complex global client state with many interrelated slices, strict team conventions, or time-travel debugging needs. Upgrade path from legacy Redux. Pair with RTK Query for API calls.',
  },
  {
    library: 'RTK Query',
    color: '#c084fc',
    badge: 'RTK Query',
    pros: [
      'Auto caching with configurable TTL — no manual cache logic',
      'Request deduplication — multiple hooks, one network call',
      'Background refetching on window focus (opt-in)',
      'Cache invalidation via providesTags/invalidatesTags',
    ],
    cons: [
      'Requires Redux Provider + middleware setup',
      'Higher conceptual overhead than React Query for Redux newcomers',
      'isLoading vs isFetching distinction trips people up',
      'Not ideal for non-REST patterns without custom baseQuery',
    ],
    when: 'Fetching server data (REST/GraphQL) when you\'re already using Redux. The best choice for apps with complex cache invalidation (e.g., invalidate post list after creating a post). If not using Redux, prefer React Query.',
  },
  {
    library: 'Zustand',
    color: '#fb923c',
    badge: 'zustand',
    pros: [
      'Tiny (~3 kb) — smallest of all state management options',
      'No Provider needed — just import and use the hook',
      'Minimal boilerplate: define state and actions in one create() call',
      'Selective subscriptions prevent unnecessary re-renders',
    ],
    cons: [
      'Module singleton — all importers share the same store instance',
      'No built-in server state caching (pair with React Query for API data)',
      'Large stores need manual slice pattern to stay organized',
      'Devtools require opt-in middleware',
    ],
    when: 'Shared client-side state that is too complex for prop drilling but does not need Redux\'s strict patterns. Excellent for UI state (modals, sidebars, selections) shared across many components.',
  },
];

function SuspenseFallback() {
  return (
    <div aria-busy="true" aria-label="Loading variant">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} className={styles.th}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_DATA.map((row, i) => (
            <tr
              key={row.library}
              className={i % 2 === 0 ? styles.trEven : styles.trOdd}
            >
              {COLUMNS.map((col) => (
                <td
                  key={col.key}
                  className={`${styles.td} ${col.key === 'library' ? styles.tdLib : ''}`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProsCons() {
  return (
    <div className={styles.prosConsSection}>
      <h2 className={styles.prosConsSectionTitle}>Pros, Cons &amp; When to Choose</h2>
      <div className={styles.prosConsGrid}>
        {PROS_CONS_DATA.map((item) => (
          <article
            key={item.library}
            className={styles.prosConsCard}
            style={{ '--card-accent': item.color }}
          >
            <header className={styles.prosConsCardHeader}>
              <span
                className={styles.prosConsBadge}
                style={{ '--badge-color': item.color }}
              >
                {item.badge}
              </span>
              <h3 className={styles.prosConsLibrary}>{item.library}</h3>
            </header>

            <div className={styles.prosConsBody}>
              <div className={styles.prosGroup}>
                <p className={styles.prosConsLabel}>
                  <span className={styles.iconPro} aria-hidden="true">+</span>
                  Pros
                </p>
                <ul className={styles.prosList}>
                  {item.pros.map((pro) => (
                    <li key={pro} className={styles.prosItem}>{pro}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.consGroup}>
                <p className={styles.prosConsLabel}>
                  <span className={styles.iconCon} aria-hidden="true">−</span>
                  Cons
                </p>
                <ul className={styles.consList}>
                  {item.cons.map((con) => (
                    <li key={con} className={styles.consItem}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className={styles.whenToChoose}>
              <p className={styles.whenLabel}>
                <span className={styles.iconWhen} aria-hidden="true">&#x2192;</span>
                When to choose
              </p>
              <p className={styles.whenText}>{item.when}</p>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function StateManagement() {
  const [activeTab, setActiveTab] = useState('variants');
  const [activeVariant, setActiveVariant] = useState('fetch');

  const ActiveVariantComponent = VARIANT_COMPONENTS[activeVariant];
  const activeVariantMeta = VARIANTS.find((v) => v.id === activeVariant);

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>State Management Showdown</h1>
        <p className={styles.subheading}>
          7 ways to fetch the same 20 posts from a real API — compare patterns,
          boilerplate, caching, and bundle size.
        </p>
      </header>

      {/* Top tab strip */}
      <div
        role="tablist"
        aria-label="Page sections"
        className={styles.mainTabList}
      >
        {[
          { id: 'variants',    label: 'Live Variants' },
          { id: 'comparison',  label: 'Comparison Table' },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.mainTab} ${activeTab === tab.id ? styles.mainTabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Variants panel */}
      {activeTab === 'variants' && (
        <div className={styles.workspace}>
          {/* Left sidebar — variant selector */}
          <aside className={styles.sidebar} aria-label="Variant selector">
            <p className={styles.sidebarLabel}>Choose a variant</p>
            <nav>
              <ul className={styles.variantList} role="list">
                {VARIANTS.map((v) => (
                  <li key={v.id}>
                    <button
                      className={`${styles.variantBtn} ${activeVariant === v.id ? styles.variantBtnActive : ''}`}
                      onClick={() => setActiveVariant(v.id)}
                      aria-current={activeVariant === v.id ? 'true' : undefined}
                    >
                      <span className={styles.variantLabel}>{v.label}</span>
                      <span
                        className={styles.variantBadge}
                        style={{ '--badge-color': v.color }}
                      >
                        {v.badge}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Right content area */}
          <div className={styles.content}>
            <div className={styles.activeLabel}>
              <span
                className={styles.activeBadge}
                style={{ '--badge-color': activeVariantMeta.color }}
              >
                {activeVariantMeta.badge}
              </span>
              <h2 className={styles.activeTitle}>{activeVariantMeta.label}</h2>
            </div>

            {/* Key is critical: forces full remount when switching variants */}
            {/* This gives each variant a fresh state instead of sharing stale data */}
            <Suspense fallback={<SuspenseFallback />}>
              <ActiveVariantComponent key={activeVariant} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Comparison Table panel */}
      {activeTab === 'comparison' && (
        <>
          <ComparisonTable />
          <ProsCons />
        </>
      )}
    </section>
  );
}
