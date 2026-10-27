# app/ — App Router rules

Scope: everything under `app/`. These rules **supplement** the root `AGENTS.md`.
Load `docs/ARCHITECTURE.md` only if you need the full picture.

## Read first

- `node_modules/next/dist/docs/` — for **any** Next.js API. This version differs from your training data.
- Especially routing, layouts, caching, revalidation, and route handler docs.

## Rules

- **Thin routes.** A `page.tsx` fetches data, composes components, and exports `metadata`. It does not contain business logic or heavy JSX.
- **No `"use client"` on route files or layouts.** Isolate interactivity into a leaf component under `components/`.
- Use the file conventions deliberately:
  - `layout.tsx` — shared shell; does not re-render on navigation within the segment
  - `page.tsx` — the route UI
  - `loading.tsx` — Suspense fallback for the segment
  - `error.tsx` — error boundary (must be a client component)
  - `not-found.tsx` — 404 for the segment
- **Route handlers** live at `app/api/<name>/route.ts`. Validate input, return typed `NextResponse`, and never leak internal errors.
- **Server Actions** live next to the feature or in `lib/<domain>/actions.ts` with `"use server"` at the top.
- Dynamic params: type them with the generated helpers (`PageProps<"/route">`, `LayoutProps<"/">`) — do not hand-roll `{ params: { id: string } }`.
- Keep route segments `kebab-case`.
- Respect `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts` — read the caching docs before adding data fetching or `fetch` options.

## Checklist before finishing

- [ ] `npm run typecheck` passes (route prop types are generated first — never run `tsc` alone on a fresh clone)
- [ ] `npm run build` passes
- [ ] New route has appropriate `loading.tsx` / `error.tsx` / `not-found.tsx` where user-facing
- [ ] Metadata exported where the page is indexable
