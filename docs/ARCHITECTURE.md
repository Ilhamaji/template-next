# Architecture

Stack: **Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Turbopack**

## Folder layout

```
app/                 # App Router — routes only, thin
  (marketing)/       # optional route groups
  api/               # route handlers (app/api/<name>/route.ts)
  layout.tsx         # root layout
  page.tsx           # home route
components/
  ui/                # dumb, reusable primitives (Button, Input, Card)
  <feature>/         # feature-scoped components
lib/
  utils.ts           # pure helpers
  <domain>/          # domain logic, data access, validation
types/               # shared types (only when used by 2+ folders)
hooks/               # client hooks ("use client" boundary lives here)
public/              # static assets
docs/                # this documentation
.agents/skills/      # agent skills
```

## Layering rules

```
app/  →  components/  →  lib/  →  (external)
 ↘            ↘            ↘
            types/ (shared by all)
```

- `app/` **orchestrates**: fetch data, compose components, define metadata. Keep pages thin.
- `components/` **renders**: no direct data fetching in `components/ui/`. Feature components may call server actions or receive props.
- `lib/` **thinks**: pure, framework-agnostic, unit-testable. No React imports.
- `types/` holds only types shared by two or more folders. Feature-local types live next to the feature.

## Server vs Client

| | Server Component (default) | Client Component (`"use client"`) |
|---|---|---|
| When | Data fetching, secrets, large deps, static markup | State, effects, event handlers, browser APIs |
| Where | Any file in `app/`/`components/` without the directive | Leaf component + its hooks |
| Cost | Zero JS shipped | Ships JS to the browser |

**Rule:** keep the `"use client"` boundary at the smallest possible leaf. Never put `"use client"` on a layout or a route file just to make one button interactive.

## Data flow

1. **Server** fetches data (in `app/` or in a `lib/<domain>` server module).
2. Data is passed to components as typed props.
3. **Mutations** go through Server Actions or route handlers in `app/api/`.
4. Client-side interactivity is isolated in leaf client components + hooks.

> Next.js 16 caches aggressively (`cacheComponents: true` in `next.config.ts`).
> Before adding data fetching, read `node_modules/next/dist/docs/` for caching and
> revalidation semantics — they differ from older versions.

## Adding a new feature — checklist

1. Route: `app/<segment>/page.tsx` (+ `layout.tsx`, `loading.tsx`, `error.tsx` as needed).
2. Components: `components/<feature>/*.tsx`; primitives go to `components/ui/`.
3. Logic: `lib/<feature>/*.ts` — pure functions, no React.
4. Types: local `types.ts` in the feature folder unless shared.
5. Update the **Index map** in the root `AGENTS.md` if a new top-level folder appears.
6. Document any new pattern in `docs/CONVENTIONS.md`.
