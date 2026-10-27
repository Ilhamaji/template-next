---
name: skill-template
description: Use when [specific triggering conditions and symptoms an agent would recognise] — replace this placeholder.
---

# <Skill Name>

> Copy this folder to `.agents/skills/<your-skill-name>/` and replace every placeholder.
> Keep this file under ~150 lines. Move depth into `reference/`.

## When to use this skill

- Use when …
- Do **not** use when … (point to the alternative)

> `description` above must state **when** to use this skill, not what it does.
> It is the only field an agent scans before deciding to load the body.

## Prerequisites

- Files you must read first:
  - `AGENTS.md` (root)
  - `<folder>/AGENTS.md` if the work touches that folder
  - `node_modules/next/dist/docs/…` for any Next.js API involved

## Steps

1. **Understand** — grep for the thing, read only the matched regions.
2. **Plan** — list the files you will touch and why. Keep the list minimal.
3. **Implement** — follow `docs/CONVENTIONS.md` and the folder's `AGENTS.md`.
4. **Verify** — `npx tsc --noEmit`, `npm run lint`, `npm run build`.
5. **Record** — update docs per the table in root `AGENTS.md` §7.

## Checklist

- [ ] Only the needed files were read (no directory dumps)
- [ ] Only the needed files were changed
- [ ] Type check, lint, and build pass
- [ ] Conventions documented if a new pattern was introduced

## Reference (load only if needed)

- `reference/example.md` — a worked example
