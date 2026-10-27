# Template Next — AI-ready Next.js template

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Turbopack

A Next.js starter pre-wired for **AI agents**: clear entrypoint, scoped rules, progressive-disclosure skills, and an explicit context budget so models stay on track and spend fewer tokens.

## Quick start

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm run lint      # ESLint
npm run typecheck # next typegen + tsc --noEmit
npm run test      # Vitest (run once)
npm run test:watch # Vitest in watch mode

# agent tooling
npm run verify:skills          # integrity + portability + Hermes bridge
npm run verify:skills:offline  # same, no network
npm run sync:hermes            # regenerate .hermes/skills/ bridge
npm run sync:hermes:check      # exit 1 if bridge drifted
```

> `npx tsc --noEmit` alone fails on a fresh clone — Next generates route types first. Always use `npm run typecheck`.

Fonts are self-hosted from `app/fonts/` (Geist, SIL OFL) via `next/font/local`. No request is made to Google Fonts at build or runtime, so the project builds on restricted networks.

## Why this template

| Problem | Solution here |
|---|---|
| Agents wander the codebase and burn tokens | `AGENTS.md` §2 defines a strict read order + hard limits |
| Rules get bloated and ignored | Folder-scoped `app/AGENTS.md`, `components/AGENTS.md`, `lib/AGENTS.md`, loaded lazily |
| Repeatable workflows re-derived every time | Skills in `.agents/skills/` — only the `description` is scanned, body loads on demand |
| Agents mix conflicting design advice | `AGENTS.md` §4.1 forces a 3-step workflow: `antislop` always, **exactly one** direction skill, optional add-ons |
| Every tool wants a different instruction file | One source of truth (`AGENTS.md`) + thin pointers for Claude, Gemini, Copilot, Cursor, Windsurf |
| Hermes Agent can't see the skills | Generated pointer bridge in `.hermes/skills/` via `npm run sync:hermes` |
| Skills only work in one agent | Skills use the open `agentskills.io` format; agents without a `skill` tool read `SKILL.md` directly |
| A skill looks installed but is broken | `npm run verify:skills` compares every skill against upstream and exits 1 on truncation |
| Undocumented decisions get re-litigated | `docs/DECISIONS.md` ADR log |
| "Done" is vague | Definition of done checklist in `AGENTS.md` §6 |

## Structure

```
AGENTS.md                  # ← agent entrypoint (start here) — SOURCE OF TRUTH
CLAUDE.md                  # pointer for Claude Code
GEMINI.md                  # pointer for Gemini CLI
.github/copilot-instructions.md  # pointer for GitHub Copilot
.github/workflows/ci.yml   # CI: lint, typecheck, build, verify skills
.cursor/rules/agents.mdc   # pointer for Cursor
.windsurfrules             # pointer for Windsurf
LICENSE                    # MIT (third-party skills keep their own)
.nvmrc                     # Node 24
docs/
  ARCHITECTURE.md          # layering, server vs client, feature checklist
  CONVENTIONS.md           # TS, naming, React, Tailwind, git
  DECISIONS.md             # ADR log
.agents/
  skills/                  # 12 skills, open agentskills.io format
  templates/               # skill skeleton (NOT auto-registered)
.hermes/
  skills/                  # GENERATED bridge for Hermes Agent (npm run sync:hermes)
scripts/
  verify-skills.cjs        # integrity + portability + bridge checker
  sync-hermes.cjs          # generates .hermes/skills/ pointers
app/
  AGENTS.md                # App Router rules
  page.tsx                 # starter page
  layout.tsx               # root layout, self-hosted fonts
  fonts/                   # Geist TTF + OFL license (no Google Fonts)
  api/health/route.ts      # example route handler
components/
  AGENTS.md                # UI rules
  ui/button.tsx            # example primitive (uses cn())
  ui/button.test.tsx       # component test
lib/
  utils.ts                 # cn() = clsx + tailwind-merge
  utils.test.ts            # unit test
types/api.ts               # shared types
hooks/use-media-query.ts   # example client hook
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
| Hermes Agent | `AGENTS.md` (skills via `.hermes/skills/` bridge) |

**Skills are tool-agnostic — with one exception.** They follow the open [agentskills.io](https://agentskills.io/specification) spec. OpenCode reads `.agents/skills/` natively (verified). **Hermes Agent does not** — it scans `.hermes/skills/`, so this repo generates a pointer bridge there: `npm run sync:hermes`.

Run `npm run verify:skills` to check integrity (truncated installs), portability (missing pointer files), and Hermes bridge sync in one pass.

> Hermes also needs the project to be a git repo. Run `git init` first.

## Using it as a template

1. Clone/copy this repo, rename it in `package.json`.
2. Read `AGENTS.md` once — it explains how the agent files fit together.
3. Update the **Index map** in `AGENTS.md` as you add top-level folders.
4. Add a skill: copy `.agents/templates/skill-template/` → `.agents/skills/<your-skill>/`, rewrite the frontmatter `name` + `description`. Keep templates **out of** `.agents/skills/` — everything in that folder is auto-registered as an active skill.
5. **Then run the required sequence** — a skill is not "added" until both pass:
   ```bash
   npm run verify:skills    # must exit 0
   npm run sync:hermes      # regenerate the Hermes bridge
   npm run verify:skills    # re-check, now includes bridge
   ```
   See `AGENTS.md` §4.3 for the full order and why each step matters.
6. Keep `docs/CONVENTIONS.md` current — it is what stops agents from re-inventing patterns.

### Writing a good skill `description`

The description is the only part scanned before a skill is loaded. It must state **when to use**, not what the skill does:

```yaml
---
name: add-api-route
description: Use when adding or changing an HTTP endpoint under app/api/ — covers validation, typed responses, and error handling.
---
```

Why *when* and not *what*: an agent that reads a summary of the workflow may believe it already knows the procedure and skip loading the skill body. State the trigger, hide the process.

## Skills are in three places

| Kind | Location | Discovered by |
|---|---|---|
| Project skills | `.agents/skills/` (in this repo) | Scanning the folder — OpenCode, Claude, Codex, Copilot, Cursor, Antigravity |
| Hermes bridge | `.hermes/skills/` (generated) | Hermes Agent scanning `.hermes/skills/` |
| Global / harness skills | Runtime-managed, outside this repo | The harness's native `skill` tool |

An agent should check **all three** before concluding no skill applies. Authoring a real skill is better guided by the harness's `writing-skills` skill (if installed) than by this template alone.

## Notes on Next.js 16

This version has breaking changes vs. older releases. The block at the top of `AGENTS.md` is regenerated by `next dev` — commit it. Consult `node_modules/next/dist/docs/` for authoritative API behaviour.
