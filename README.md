# Template Next — AI-ready Next.js template

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Turbopack

A Next.js starter pre-wired for **AI agents**: clear entrypoint, scoped rules, progressive-disclosure skills, and an explicit context budget so models stay on track and spend fewer tokens.

## Quick start

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type check
```

## Why this template

| Problem | Solution here |
|---|---|
| Agents wander the codebase and burn tokens | `AGENTS.md` §2 defines a strict read order + hard limits |
| Every tool wants a different instruction file | Single `AGENTS.md` entrypoint; thin pointers for `CLAUDE.md`, `.cursor/rules/` |
| Rules get bloated and ignored | Folder-scoped `app/AGENTS.md`, `components/AGENTS.md`, `lib/AGENTS.md`, loaded lazily |
| Repeatable workflows re-derived every time | Skills in `.agents/skills/` — only the `description` is scanned, body loads on demand |
| Agents mix conflicting design advice | `AGENTS.md` §4.1 forces a 3-step workflow: `antislop` always, **exactly one** direction skill, optional add-ons |
| Every tool wants a different instruction file | One source of truth (`AGENTS.md`) + thin pointers for Claude, Gemini, Copilot, Cursor, Windsurf |
| Skills only work in one agent | Skills use the open `agentskills.io` format; agents without a `skill` tool read `SKILL.md` directly |
| Undocumented decisions get re-litigated | `docs/DECISIONS.md` ADR log |
| "Done" is vague | Definition of done checklist in `AGENTS.md` §6 |

## Structure

```
AGENTS.md                  # ← agent entrypoint (start here) — SOURCE OF TRUTH
CLAUDE.md                  # pointer for Claude Code
GEMINI.md                  # pointer for Gemini CLI
.github/copilot-instructions.md  # pointer for GitHub Copilot
.cursor/rules/agents.mdc   # pointer for Cursor
.windsurfrules             # pointer for Windsurf
docs/
  ARCHITECTURE.md          # layering, server vs client, feature checklist
  CONVENTIONS.md           # TS, naming, React, Tailwind, git
  DECISIONS.md             # ADR log
.agents/
  skills/                  # 12 skills, open agentskills.io format
  templates/               # skill skeleton (NOT auto-registered)
scripts/
  verify-skills.cjs        # integrity + portability checker
app/AGENTS.md              # App Router rules
components/AGENTS.md       # UI rules
lib/AGENTS.md              # logic rules
app/                       # routes
components/ui/             # primitives
lib/                       # framework-agnostic logic
types/                     # shared types
hooks/                     # client hooks
```

## Works with any agent

`AGENTS.md` is the single source of truth. Every other file is a thin pointer so no rule lives in two places:

| Tool | Entry file |
|---|---|
| **OpenCode** (current), Codex, Antigravity, Aider, Zed | `AGENTS.md` |
| Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/agents.mdc` |
| Windsurf | `.windsurfrules` |

**Skills are tool-agnostic — with one exception.** They follow the open [agentskills.io](https://agentskills.io/specification) spec. OpenCode reads `.agents/skills/` natively (verified). **Hermes Agent does not** — it scans `.hermes/skills/`, so this repo generates a pointer bridge there: `npm run sync:hermes`.

Run `npm run verify:skills` to check integrity (truncated installs), portability (missing pointer files), and Hermes bridge sync in one pass.

> Hermes also needs the project to be a git repo. Run `git init` first.

## Using it as a template

1. Clone/copy this repo, rename it in `package.json`.
2. Read `AGENTS.md` once — it explains how the agent files fit together.
3. Update the **Index map** in `AGENTS.md` as you add top-level folders.
4. Add a skill: copy `.agents/templates/skill-template/` → `.agents/skills/<your-skill>/`, rewrite the frontmatter `name` + `description`. Keep templates **out of** `.agents/skills/` — everything in that folder is auto-registered as an active skill.
5. Keep `docs/CONVENTIONS.md` current — it is what stops agents from re-inventing patterns.

### Writing a good skill `description`

The description is the only part scanned before a skill is loaded. It must state **when to use**, not what the skill does:

```yaml
---
name: add-api-route
description: Use when adding or changing an HTTP endpoint under app/api/ — covers validation, typed responses, and error handling.
---
```

Why *when* and not *what*: an agent that reads a summary of the workflow may believe it already knows the procedure and skip loading the skill body. State the trigger, hide the process.

## Skills are in two places

| Kind | Location | Discovered by |
|---|---|---|
| Project skills | `.agents/skills/` (in this repo) | Scanning the folder |
| Global / harness skills | Runtime-managed, outside this repo | The harness's native `skill` tool |

An agent should check **both** before concluding no skill applies. Authoring a real skill is better guided by the harness's `writing-skills` skill (if installed) than by this template alone.

## Notes on Next.js 16

This version has breaking changes vs. older releases. The block at the top of `AGENTS.md` is regenerated by `next dev` — commit it. Consult `node_modules/next/dist/docs/` for authoritative API behaviour.
