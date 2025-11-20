# AI Coding Agent Instructions

These instructions orient AI agents quickly within the `church-prompt-directory` Astro + React project. Focus on existing patterns; do not introduce speculative architecture.

## 1. High-Level Architecture
- Framework: Astro (hybrid) with React islands via `client:load` on interactive components (`DirectoryContent`, `Header`, `Footer`).
- Layout chain: `MainLayout.astro` wraps pages -> delegates to `BaseLayout.astro` for `<head>` meta and global structure.
- Pages = routes: files in `src/pages/**`. Nested folders map to route segments (e.g. `src/pages/directory/index.astro` -> `/directory`). Dynamic route example: `src/pages/directory/[id].astro` (pattern to add entity detail pages).
- Data layer currently static JSON in `src/data/*.json` (categories, prompts, users). No runtime DB calls yet despite `@astrojs/db` dependency.

## 2. Module & Path Conventions
- Path alias: `@/` -> `./src/` (configured in `tsconfig.json`). Use `@/components/...` rather than relative traversals.
- React components colocate their prop TypeScript interfaces at top-of-file (e.g. `DirectoryContent.tsx`). Keep this pattern.
- Avoid global state libraries; local `useState` + `useEffect` + URL search params manage state.
- Client directives: only add `client:load` (or other Astro client directives) on parent wrapper component, not on deeply nested leaf nodes, to minimize island surface.

## 3. Data Shapes (Reflect Existing JSON)
- Prompt object (subset): `{ id, title, content, excerpt, category, tags[], authorId, authorName, status, usageCount, executionCount, createdAt, updatedAt, featured? }`.
- Category object: `{ id, name, description, icon, promptCount }`.
- Maintain these keys when extending; add optional fields with defensive checks.

## 4. Filtering & URL State Pattern
- Pattern lives in `DirectoryContent.tsx`: initialize filters from `window.location.search` then mirror internal state changes back to the URL using `history.replaceState`. Replicate this approach for any new list + filter views (shareable URLs, no full page reload).
- Memoization: `useMemo` consolidates filtering logic; keep pure functions for predictability.

## 5. UI & Styling
- Tailwind with CSS custom properties: semantic color tokens defined in `tailwind.config.mjs` mapping to `--variable` names. When adding new color roles, extend `tailwind.config.mjs` not raw hex scattered in components.
- Reusable UI primitives reside in `src/components/ui/*` (e.g. `button.tsx`, `badge.tsx`). Prefer composing these rather than introducing duplicate styled elements.
- Use utility classes + existing variants (`class-variance-authority` and `tailwind-merge` present) for conditional styling instead of manual string concatenation.

## 6. Component & Layout Patterns
- Layout responsibilities: `MainLayout.astro` sets page-level wrapper, accessibility skip link, and passes auth flags; `Header` & `Footer` are React islands for interactive/navigation logic.
- Slot usage: `<slot />` in layouts to inject page content—preserve this when creating new layout tiers.
- Skeleton/loading pattern: See `PromptGrid.tsx` using inline skeleton components from `ui/skeleton.tsx`. Reuse this pattern for pending states.

## 7. Adding New Features
- New route: create `.astro` under `src/pages/your/route/index.astro`; import layout; supply title & description props for SEO.
- New interactive list: Astro page + React island component; load initial static data via `import data from '@/data/*.json'` then enhance client-side.
- New data file: place JSON under `src/data/`; ensure deterministic keys & small size (static import bundles at build time).

## 8. Performance Considerations
- Keep islands coarse-grained (entire filter panel + grid together) instead of many small islands to reduce hydration overhead.
- Expensive computations (filtering) already wrapped in `useMemo`; if adding heavier logic, consider precomputing server-side in `.astro` before passing props.

## 9. Build & Dev Workflow
- Install: `npm install`
- Dev server: `npm run dev` (default port 4321 unless changed).
- Production build: `npm run build` -> outputs to `dist/`.
- Preview build: `npm run preview`.
- No test suite currently; if introduced, add script (`test`) and update this file.

## 10. Code Quality & Extension
- Maintain strict TS config (`extends: astro/tsconfigs/strict`). Add types rather than using `any`.
- Favor declarative JSX + small pure helper components over large monolith components.
- When extending filtering, do not mutate original arrays; use derived arrays (`results = results.filter(...)`).

## 11. Safe Changes Checklist
- Use path alias `@/` for new imports.
- Preserve existing prop naming and casing conventions (`initialPrompts`, `categories`, `isLoading`).
- Keep accessibility touches (skip link, labels on form controls) when modifying layouts or filters.

Questions or clarifications needed? Provide feedback on missing workflows (auth, persistence, testing) and this file will be iterated.
