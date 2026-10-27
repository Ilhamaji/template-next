# Agent instructions

**Read [`AGENTS.md`](./AGENTS.md) first.** It is the single source of truth for all agents.

Folder-scoped rules (load only the one you need):

- `app/AGENTS.md` — App Router rules
- `components/AGENTS.md` — UI rules
- `lib/AGENTS.md` — logic rules

Documentation: `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, `docs/DECISIONS.md`.
Skills: `.agents/skills/` — scan `SKILL.md` frontmatter `description`, load on demand.
Verify skills after installing: `npm run verify:skills`.
