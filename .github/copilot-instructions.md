# AI Coding Agent Instructions

These instructions orient AI agents quickly within the `church-prompt-directory` Astro + React project. Focus on existing patterns; do not introduce speculative architecture.

## 1. High-Level Architecture
- **Framework**: Astro (hybrid SSR/SSG) with React islands via `client:load` or `client:only="react"` on interactive components
- **Data Backend**: Convex (serverless functions + real-time DB) replaces static JSON; schema in `convex/schema.ts`
- **Authentication**: Clerk integration with `@clerk/astro` + middleware protection for `/profile`, `/submit`, `/admin` routes
- **Layout Chain**: `MainLayout.astro` → `BaseLayout.astro` for consistent `<head>` meta and global structure
- **Routing**: Files in `src/pages/**` map to routes (e.g. `src/pages/directory/index.astro` → `/directory`). Dynamic route pattern: `[id].astro`

## 2. Data Layer Architecture (Convex Integration)
- **Schema**: `convex/schema.ts` defines `users`, `prompts`, `categories`, `favorites`, `promptExecutions` tables with indexes
- **Functions**: `convex/prompts.ts`, `convex/users.ts`, `convex/categories.ts` export query/mutation functions
- **Client Usage**: React islands use `useQuery(api.prompts.getApprovedPrompts, { ...args })` from `convex/react`
- **Auth Bridge**: `ConvexClientProvider` wraps components, uses `ConvexProviderWithClerk` with custom `useAuth` hook bridge
- **HTTP Routes**: `convex/http.ts` defines webhook endpoints (`/clerk/webhook`) and migration endpoints (`/migrate/seed`)
- **Provider Pattern**: Interactive pages wrap components with `ConvexClientProvider` (see `DirectoryWithProvider.tsx`)

## 3. Authentication & Authorization
- **Middleware**: `src/middleware.ts` uses `clerkMiddleware` with route matchers for protected routes
- **Role Checking**: Admin routes check `sessionClaims?.metadata?.role === 'admin'` from Clerk
- **JWT Template**: Clerk JWT template named `convex` required with audience `convex` and issuer matching Clerk domain
- **Auth Config**: `convex/auth.config.ts` contains Clerk domain and applicationID for Convex auth provider
- **Anonymous Tracking**: `src/lib/anonymousTracking.ts` tracks 10-view limit for non-authenticated users via localStorage

## 4. Module & Path Conventions
- **Path Alias**: `@/` → `./src/` (configured in `tsconfig.json`). Always use `@/components/...` over relative paths
- **Type Colocation**: React components define prop TypeScript interfaces at top-of-file (see `DirectoryContent.tsx`)
- **State Management**: Local `useState` + `useEffect` + URL search params (no global state libraries)
- **Client Directives**: Use `client:load` on wrapper components or `client:only="react"` for Convex-dependent islands to minimize hydration surface

## 5. Filtering & URL State Pattern
- **Reference**: `DirectoryContent.tsx` demonstrates canonical pattern
- **Init from URL**: `useEffect` reads `URLSearchParams` on mount to initialize filter state
- **Sync to URL**: `useEffect` with dependencies updates URL via `history.replaceState` (shareable, no page reload)
- **Memoization**: `useMemo` for expensive filtering operations; keep pure functions

## 6. UI & Styling
- **Tailwind + CSS Variables**: Semantic tokens in `tailwind.config.mjs` map to `--variable` names (e.g. `hsl(var(--primary))`)
- **UI Primitives**: `src/components/ui/*` (button, badge, card, dialog, tabs, tooltip, skeleton) built with Radix UI + CVA
- **Styling Pattern**: Compose primitives with `class-variance-authority` + `tailwind-merge` for conditional variants
- **No Raw Hex**: Extend `tailwind.config.mjs` for new colors, don't scatter hex values in components

## 7. Component Patterns
- **Layout Responsibilities**: `MainLayout.astro` provides accessibility skip link, wraps Header/Footer islands, delegates `<head>` to `BaseLayout`
- **Convex Provider Wrapper**: Pages with Convex queries pass `convexUrl` from `import.meta.env.PUBLIC_CONVEX_URL` to provider components
- **Loading States**: Use skeleton pattern from `ui/skeleton.tsx` (see `PromptGrid.tsx` for reference)
- **Prop Drilling**: Pass `convexUrl` explicitly through component tree to provider (no global context)

## 8. Environment & Deployment
- **Required Env Vars**: `PUBLIC_CONVEX_URL`, `CONVEX_URL`, `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` in `.env.local`
- **Convex Secrets**: Set via `npx convex env set CLERK_WEBHOOK_SECRET "whsec_..."` and `MIGRATION_SECRET` for seeding
- **Webhook Setup**: Clerk webhook points to `https://<convex-deployment>.convex.cloud/clerk/webhook` with `user.*` events
- **Data Migration**: `npm run migrate:seed` with `SEED_URL` and `SEED_SECRET` env vars to populate Convex from `src/data/*.json`

## 9. Development Workflows
```bash
npm install                   # Install dependencies
npm run dev                   # Astro dev server (port 4321)
npx convex dev                # Convex dev environment (optional separate terminal)
npm run build                 # Production build → dist/
npm run preview               # Preview production build
npm run migrate:seed          # Seed Convex with JSON data (requires SEED_URL & SEED_SECRET)
npx convex deploy             # Deploy Convex functions
```

## 10. Adding New Features
- **New Route**: Create `.astro` under `src/pages/`, import `MainLayout`, pass `title` and `description` props
- **New Convex Query**: Add to `convex/*.ts`, export with `query()` or `mutation()`, use args validation with `v.object({})`
- **New Interactive Component**: Create React component → wrap with provider → use in `.astro` with `client:only="react"`
- **New Protected Route**: Add path pattern to `isProtectedRoute` matcher in `src/middleware.ts`
- **New Admin Route**: Add to `isAdminRoute` matcher and ensure role check logic applies

## 11. Data Query Patterns
- **Approved Prompts**: `api.prompts.getApprovedPrompts` with optional `{ category, search, limit, sort }` args
- **Index Usage**: Convex queries use `.withIndex()` for efficient filtering (see `by_status`, `by_category`, `by_author`)
- **Client Filtering**: Single-category filters use Convex; multi-category filters apply client-side via `useMemo`
- **Sort Options**: `'usage'` (usageCount desc), `'recent'` (createdAt desc), `'featured'` (featured first), default (mixed heuristic)

## 12. Code Quality & Constraints
- **Strict TypeScript**: Extends `astro/tsconfigs/strict`. Add explicit types, avoid `any`
- **Immutable Filtering**: Never mutate original arrays; chain `.filter()`, `.map()`, `.sort()` on derived arrays
- **Small Components**: Favor declarative JSX with small pure helpers over monoliths
- **Accessibility**: Maintain skip links, ARIA labels, keyboard navigation patterns
- **Prop Naming**: Use existing conventions (`initialPrompts`, `categories`, `isLoading`, `convexUrl`)

## 13. Testing
- Test runner: Vitest (config implied by `devDependencies`)
- Existing tests: `tests/queries.test.ts` (property-based testing with `fast-check`)
- Run tests: `npm test` (add to package.json if missing)

## 14. Common Pitfalls
- **Missing JWT Template**: Convex auth fails without Clerk JWT template named `convex` with correct audience/issuer
- **Wrong Client Directive**: Use `client:only="react"` for Convex-dependent components to avoid SSR hydration errors
- **Provider Nesting**: Always wrap Convex queries inside `<ConvexClientProvider>`, never call `useQuery` outside provider
- **Index Misuse**: Don't filter on non-indexed fields in Convex queries; apply client-side or add schema index
- **Static Data Assumption**: `src/data/*.json` used for seeding only; runtime data comes from Convex

## 15. Key Files Reference
- `convex/schema.ts` - Database schema and indexes
- `src/middleware.ts` - Route protection and role-based access
- `src/components/directory/DirectoryContent.tsx` - URL state + filtering pattern
- `src/components/providers/ConvexClientProvider.tsx` - Clerk-Convex auth bridge
- `tailwind.config.mjs` - Design system tokens
- `scripts/migrate.mjs` - Data seeding workflow

When unclear, examine these files for established patterns before introducing new approaches.
