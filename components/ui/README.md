# components/ui/

Reusable UI primitives. **Search here before creating anything new.**

## Rules for this folder

- No data fetching, no domain knowledge, no `lib/<domain>` imports.
- Props fully typed and exported alongside the component.
- Server Component by default; `"use client"` only for interactive primitives
  (button with handlers, input, dialog, dropdown).
- Styling via Tailwind utilities + `cn()` from `lib/utils.ts`.
- Accessible: semantic element, keyboard-operable, focus ring preserved.
