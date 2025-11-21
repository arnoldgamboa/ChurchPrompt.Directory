# Boot Data Caching Summary

This document outlines the caching approach implemented for the Directory boot data in the Church Prompt Directory project.

## Goals
- Speed up the Directory page initial render by avoiding multiple Convex round trips for categories and recent prompts.
- Provide a lightweight, safe client-side fallback when the Convex query has not yet resolved.
- Keep data fresh through a short time-to-live (TTL) and background refresh.

## What is cached
  - `categories`: array of category docs
  - `recentPrompts`: small summary list of the most recent prompts (limit 3)
  - `meta`: light metadata describing generation time / counts

This boot data is persisted as a single object client-side.

## How it works (flow)

1. Page mounts (client): `DirectoryContent` begins a `useQuery(api.directory.getDirectoryBootData)`.
2. On mount, component attempts to read `localStorage.directoryBootData` and validates the `ts` field.
   - If age < `BOOT_CACHE_TTL_MS` (5 minutes), cached data is used immediately.
   - If no cached data or stale, component does not set `cachedBootData` and waits for query.
3. `useQuery` runs regardless; when the result (`bootData`) resolves, the hook stores the fresh `bootData` in localStorage and updates state so the UI can reflect fresh data—this is the background refresh step.
4. UI rendering uses `effectiveBoot = bootData || cachedBootData` so cached data is used only if `bootData` is undefined yet.

## Key constants & location
- `BOOT_CACHE_KEY = 'directoryBootData'` — in `src/components/directory/DirectoryContent.tsx`.
- `BOOT_CACHE_TTL_MS = 5 * 60 * 1000` (5 minutes) — in `DirectoryContent.tsx`. Adjust as needed in the future.

## Safe-guards & Edge Cases
- SSR: All `localStorage` reads/writes occur within `useEffect` (client-only), not during SSR.
- Parse errors: `JSON.parse(...)` is guarded with `try/catch` to avoid runtime exceptions for malformed values.
- Storage limits: `localStorage` can fail if the browser denies access or is full (handled via `try/catch`).
- Race conditions: If the query resolves quickly and cached data is present, the query result wins and overwrites cached state. This prevents stale UI.

## Testing & Verification
- Run Dev UI and confirm Directory initial render uses cached values (open DevTools -> Application -> Local Storage and pre-seed a `directoryBootData` payload with `ts=Date.now()` then reload page).
- To validate background refresh: seed with older `ts` (older than TTL), then reload and verify the UI updates once the Convex query resolves.
- Clear cache: Remove `directoryBootData` from `localStorage` and confirm Directory shows the spinner/placeholder until `useQuery` resolves.

## Example key snippets
`convex/directory.ts` pagination example (real code exists in repo):
```ts
export const getDirectoryBootData = query({
  handler: async ({ db }) => ({
    categories: await db.query('categories').collect(),
    recentPrompts: /* approved prompts sort by createdAt, limit 3 */ [],
    meta: { generatedAt: Date.now() }
  })
});
```

Client `DirectoryContent.tsx` key snippet:
```tsx
const BOOT_CACHE_KEY = 'directoryBootData';
const BOOT_CACHE_TTL_MS = 5 * 60 * 1000;
const bootData = useQuery(api.directory.getDirectoryBootData);
const [cachedBootData, setCachedBootData] = useState<DirectoryBootData | null>(null);

useEffect(() => {
  const raw = window.localStorage.getItem(BOOT_CACHE_KEY);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  if (Date.now() - parsed.ts < BOOT_CACHE_TTL_MS) setCachedBootData(parsed.data);
}, []);

useEffect(() => {
  if (bootData) {
    window.localStorage.setItem(BOOT_CACHE_KEY, JSON.stringify({ data: bootData, ts: Date.now() }));
    setCachedBootData(bootData);
  }
}, [bootData]);

const effectiveBoot = bootData || cachedBootData;
```

## Why this choice
- Simplicity: localStorage is easy to implement and fits our short TTL use-case with no extra infra.
- Safety: the approach avoids permanent write-thru caching and keeps the server authority.
- Performance: the Directory page benefits from immediate UI data on cold loads.

## Potential Improvements
- Etag & Cache-Control: Return `Cache-Control` or ETag from the Convex / API gateway to support HTTP caching.
- Service Worker: Implement a SW to persist more robust offline behavior and advanced cache strategies for richer UX.
- Version/Hash: Add a version hash to the boot data; if hash changes, the client drops the cache.
- Larger TTL for infrequently updated data (e.g., categories) and smaller TTL for highly dynamic data (e.g., recent prompts).
- Implement optimistic mutation updates for `usageCount` and `executionCount` to avoid reloading the entire boot data.

## Operations / Maintenance
- Clearing cache: `localStorage.removeItem('directoryBootData')` — useful for dev testing.
- Admin changes: consider emitting an event or invalidation endpoint when a category is updated so all clients can bump a cache version.

## Troubleshooting
- If Directory still shows stale data after background refresh, check network tab for Convex query or ensure your browser doesn't block requests.
- If `localStorage.getItem` throws, check if `localStorage` is allowed (e.g., privacy mode may disable access).
- If you want to enable server-side caching (CDN/HTTP headers), ensure you add Cache-Control headers in your hosting platform. Convex's read-only query endpoints typically support CDN caching configurations.

## Questions? 
If you want me to wire either server-side headers, service worker caching, or a small admin-triggered cache invalidation endpoint, say which of the improvements you'd like and I can implement it.

---
File references:
- `convex/directory.ts` - aggregated boot query
- `src/components/directory/DirectoryContent.tsx` - client-side caching and TTL constants
- `src/components/directory/DirectoryWithProvider.tsx` - Provider wrapper

`Last updated: ${new Date().toISOString()}`

## Where caching is implemented
- Convex query: `convex/directory.ts` (`getDirectoryBootData`) returns typed `DirectoryBootData` with categories and recent prompts.
- Client component: `src/components/directory/DirectoryContent.tsx` integrates caching and uses the cache while the Convex query runs in the background.
- Provider wrapper: `src/components/directory/DirectoryWithProvider.tsx` ensures `ConvexClientProvider` is available for client-side queries.

## Implementation Details
- Local storage key: `directoryBootData` (JSON): { data: DirectoryBootData, ts: number }
- TTL: 5 minutes (configurable constant `BOOT_CACHE_TTL_MS`) — set in `DirectoryContent.tsx`.
- Effective boot data used by the component:
  - If the Convex query (`bootData`) is defined, use it (and immediately persist it to localStorage).
  - Else use `cachedBootData` if it exists and is fresh.
  - Else wait for the query.

### Key behaviors
- Boot data always re-fetches on mount via Convex `useQuery(...)`. The cached data is a read-only speed-up while the query completes.
- When the query resolves, it overwrites both `cachedBootData` (via `localStorage.setItem(...)`) and the UI state, ensuring eventual correctness.
- If `localStorage` access is unavailable or malformed data is present, code catches and ignores errors gracefully.
- SSR guard: localStorage access is performed inside `useEffect` and only runs on the client.

## 