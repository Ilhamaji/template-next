# Agent instructions

**Read [`AGENTS.md`](./AGENTS.md) first.** It is the single source of truth for all agents — Claude Code, Codex, Cursor, Gemini, Copilot, Windsurf, and anything else that reads this file.

Do not duplicate rules here. If something is wrong or missing, fix `AGENTS.md`.

## Folder-scoped rules

Load only the one matching the folder you are editing:

| Folder | Rules file |
|---|---|
| `app/` | `app/AGENTS.md` |
| `components/` | `components/AGENTS.md` |
| `lib/` | `lib/AGENTS.md` |

## Other important files

| File | Contains |
|---|---|
| `docs/ARCHITECTURE.md` | Layering, server vs client, feature checklist |
| `docs/CONVENTIONS.md` | TypeScript, naming, React, Tailwind, git |
| `docs/DECISIONS.md` | ADR log |
| `.agents/skills/` | Skills — scan `SKILL.md` frontmatter `description`, load on demand |
| `scripts/verify-skills.cjs` | Integrity checker: `npm run verify:skills` |

## Commands

```bash
npm run dev / build / start / lint
npx tsc --noEmit
npm run verify:skills
```
