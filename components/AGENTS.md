# components/ — UI rules

Scope: everything under `components/`. Supplements the root `AGENTS.md`.

## Structure

```
components/
  ui/           # primitives: no data fetching, no domain knowledge, fully reusable
  <feature>/    # feature components: may know about the domain, receive typed props
```

- Need a button/input/card → check `components/ui/` first. **Search before creating.**
- Reused in 2+ features → promote to `components/ui/`.
- Used by one feature → keep it in `components/<feature>/`.

## Rules

- **Server Components by default.** Add `"use client"` only for state, effects, handlers, or browser APIs — and only on the smallest leaf.
- One component per file, file named `kebab-case.tsx`, export `PascalCase`.
- Props are a named type: `type UserCardProps = { … }`. Destructure in the signature.
- No `useEffect` for derived state — compute during render.
- `next/image` for images, `next/link` for internal links.
- Styling: Tailwind utilities inline; combine conditional classes with `cn()` from `lib/utils.ts`.
- No data fetching in `components/ui/`. Feature components may use server actions or receive data as props.
- Stable `key`s only — never array index for dynamic lists.
- Accessibility: semantic elements, `aria-*` where needed, focus styles preserved, `alt` on every image.

## Adding a primitive — checklist

- [ ] Searched `components/ui/` for an existing equivalent
- [ ] No domain-specific imports
- [ ] Props typed and exported
- [ ] Handles disabled / loading / focus states where relevant
- [ ] Works with keyboard only
