# Conventions

Short, enforceable rules. If a rule needs justification, it goes in `docs/DECISIONS.md`.

## TypeScript

- `strict` is on. No `any`, no non-null `!` unless provably safe.
- Prefer `type` for unions/objects, `interface` for extensible contracts. Be consistent within a file.
- Export types explicitly; avoid `export *`.
- Use `import type { X } from "..."` for type-only imports.
- Path alias: `@/*` → repo root. Use it instead of long relative chains.

```ts
import type { Foo } from "@/types/foo";      // ✅
import { Button } from "@/components/ui/button"; // ✅
import { Button } from "../../components/ui/button"; // ❌
```

## Naming

| Thing | Case | Example |
|---|---|---|
| Files (components) | `kebab-case.tsx` | `user-card.tsx` |
| Files (logic) | `kebab-case.ts` | `format-date.ts` |
| Components | `PascalCase` | `UserCard` |
| Hooks | `useCamelCase` | `useMediaQuery` |
| Functions / vars | `camelCase` | `getUserById` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Types / interfaces | `PascalCase` | `UserProfile` |
| Route segments | `kebab-case` | `app/user-settings/` |

## React

- Server Components by default; `"use client"` only when required, at the lowest leaf.
- One component per file; the file name matches the component.
- Props: define a `ComponentNameProps` type, destructure in the signature.
- No `useEffect` for derived state — compute during render.
- Keys must be stable IDs, never array index (unless the list is static).
- `next/image` for all images; `next/link` for internal navigation.

## Frontend skill workflow (mandatory)

Before writing any UI code, follow the 3-step workflow in `AGENTS.md` §4.1:

1. **`antislop`** — always. The core filter against generic AI output.
2. **Exactly one** direction skill — `frontend-design` (landing/company profile), `impeccable` (dashboard/app UI), or `design-taste-frontend` (portfolio/creative). Never two.
3. **Optional** — `ui-ux-pro-max` only if you have no brand guidelines; `web-design-guidelines` as a final audit before ship.

## Styling (Tailwind 4)

- Tailwind utilities inline. No separate CSS files unless there's a real need.
- Extract a component before extracting a `@apply` class.
- Use design tokens from `app/globals.css` (`--color-*`, `--font-*`) instead of raw hex.
- Conditional classes: use a `cn()` helper in `lib/utils.ts`, never string concatenation with ternaries scattered inline.
  `cn()` combines `clsx` (conditional values) with `tailwind-merge` (last-wins conflict resolution), so a caller's
  `className` overrides a component's defaults instead of emitting duplicate utilities like `px-2 px-4`.
  Behavior is covered by `lib/utils.test.ts` (`npm run test`).
- Mobile-first: base styles first, then `sm:` / `md:` / `lg:`.

## Data & errors

- Validate external input at the boundary (route handler / server action) before use.
- Never leak stack traces or internal errors to the client; log server-side, return a generic message.
- Use `error.tsx` + `not-found.tsx` boundaries at the route segment level.
- Loading states: prefer `loading.tsx` / Suspense over client-side spinners.

## Git

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- One logical change per commit. Commit the `AGENTS.md` rules block that `next dev` regenerates.
- Do not commit secrets. `.env*` is gitignored — add `.env.example` when introducing env vars.

## Documentation duties for agents

- New project-wide pattern → append a section here.
- New folder-scoped rule → the folder's nested `AGENTS.md`.
- Decision with trade-offs → `docs/DECISIONS.md`.
- Repeatable workflow → a skill in `.agents/skills/`.
