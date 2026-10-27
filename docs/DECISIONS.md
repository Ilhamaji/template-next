# Decisions (ADR log)

Append-only. Newest at the bottom. One entry per non-obvious decision.

## Template

```
## NNN — Title

- **Date:** YYYY-MM-DD
- **Status:** proposed | accepted | superseded by NNN
- **Context:** what forced a choice
- **Decision:** what we chose
- **Consequences:** what gets easier, what gets harder
```

---

## 001 — Agent entrypoint at `AGENTS.md` with nested overrides

- **Date:** 2026-01-01
- **Status:** accepted
- **Context:** Multiple AI tools (Claude, Codex, Cursor, Gemini/Antigravity, Copilot) read different filenames. Duplicating instructions per tool drifts out of sync.
- **Decision:** One root `AGENTS.md` as the universal entrypoint, plus folder-local `AGENTS.md` files that are loaded only when working in that folder.
- **Consequences:** Every agent reads one file; context stays small because folder rules are lazy-loaded. Tools that don't support `AGENTS.md` need a one-line pointer file (`CLAUDE.md`, `.cursor/rules`, etc.).

## 002 — Skills live in `.agents/skills/`

- **Date:** 2026-01-01
- **Status:** accepted
- **Context:** Reusable multi-step workflows (e.g. "add a feature", "write a route handler") bloat the entrypoint if inlined.
- **Decision:** Each skill is `.agents/skills/<name>/SKILL.md` with `name` + `description` frontmatter. Agents scan descriptions only, then load on demand.
- **Consequences:** Progressive disclosure keeps base context tiny. Requires discipline to keep `SKILL.md` short and push depth into `reference/`.

## 003 — Server Components by default, client boundary at leaves

- **Date:** 2026-01-01
- **Status:** accepted
- **Context:** Blanket `"use client"` ships unnecessary JS and blocks server-side data access.
- **Decision:** No directive unless a component needs state/effects/handlers/browser APIs; push the directive to the smallest leaf.
- **Consequences:** Smaller bundles and simpler data flow; occasional prop-drilling or extra component splits.
