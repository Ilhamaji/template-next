<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Template Next — Agent Entrypoint

You are working in a **Next.js 16 + React 19 + Tailwind 4 + TypeScript** template.
This file is the single entrypoint for all AI agents (Claude, Codex, Cursor, Gemini/Antigravity, Copilot, etc.).
Read it first, then load only the files you actually need.

---

## 1. Golden rules (never skip these)

1. **Read before you write.** Read `node_modules/next/dist/docs/` for any Next.js API you are unsure about. This version differs from your training data.
2. **Server Components by default.** Add `"use client"` only when a component needs state, effects, event handlers, or browser APIs. Push client boundaries as low in the tree as possible.
3. **Stay inside the architecture.** Route files live in `app/`, reusable UI in `components/`, logic in `lib/`, shared types in `types/`. See `docs/ARCHITECTURE.md`.
4. **No new dependencies without a reason.** Ask before installing a package. Prefer the platform and existing deps.
5. **Type-safe, no `any`.** No `@ts-ignore` without a comment explaining why.
6. **Verify your work.** Run `npm run lint` and `npm run build` (or `npx tsc --noEmit`) before claiming a task is done.
7. **Small diffs.** Change only what the task requires. Do not reformat, rename, or refactor unrelated code.

---

## 2. Context budget — read this before opening files

Context is expensive. Follow this order and stop as soon as you have enough:

| Step | Do this | Stop when |
|------|---------|-----------|
| 1 | Read this file (`AGENTS.md`) | — |
| 2 | Check the **Index map** below for the relevant folder | You know which folder owns the work |
| 3 | Read the nested `AGENTS.md` of that folder, if it exists | You know the local rules |
| 4 | `grep` / `search` for the symbol, file, or string you need | You found the file path |
| 5 | Read **only the matched region** of a file (`offset`/`limit`) | You have the exact code |
| 6 | Load a **skill** from `.agents/skills/` only if the task matches its description | — |

**Hard limits for agents:**

- ❌ Do **not** dump whole directories or run recursive reads "to understand the project".
- ❌ Do **not** read `node_modules/`, `.next/`, `package-lock.json`, or build output. Only read specific docs files under `node_modules/next/dist/docs/` when needed.
- ❌ Do **not** re-read a file in the same session unless it changed.
- ✅ Prefer `grep` over `read` when you only need one symbol.
- ✅ Prefer reading a skill's `SKILL.md` (short) over re-deriving conventions from code.
- ✅ Summarise what you learned in one or two lines before continuing, and keep that summary in working memory.
- ✅ When a file exceeds ~300 lines, read it in slices around the relevant lines.

---

## 3. Index map — where things live

Update this table **when you add a new top-level folder or introduce a new area of the codebase**.

| Path | Contains | Read when |
|------|----------|-----------|
| `app/` | App Router: routes, layouts, loading/error/not-found boundaries, route handlers. See `app/AGENTS.md`. | Adding/changing a page, route, layout, or API endpoint |
| `components/` | Reusable UI, split into `ui/` (primitives) and feature components. See `components/AGENTS.md`. | Building UI or reusing an existing component |
| `lib/` | Framework-agnostic logic: data fetching, utils, validation, constants, clients. See `lib/AGENTS.md`. | Adding business logic, a helper, a data source |
| `types/` | Shared TypeScript types/interfaces. | Sharing a type across folders |
| `hooks/` | Client-side React hooks. | Needing client state/effects logic |
| `public/` | Static assets served from `/`. | Referencing images, icons, fonts |
| `docs/` | Human + agent documentation. `ARCHITECTURE.md`, `CONVENTIONS.md`, `DECISIONS.md`. | Needing project-level rules or past decisions |
| `.agents/skills/` | Installable skills. Anything here is **auto-registered** as an active skill. Each is `SKILL.md` with frontmatter. | A task matches a skill description |
| `.agents/templates/` | Non-active templates (e.g. `skill-template/`). Not scanned as skills. | Creating a new skill |
| `scripts/verify-skills.cjs` | Integrity checker: compares every skill against its upstream repo, flags empty folders, missing files, broken imports, plus portability (pointer files, Hermes bridge). | After installing or updating skills; before trusting a skill |
| `scripts/sync-hermes.cjs` | Generates `.hermes/skills/` pointer bridge so Hermes Agent can discover the skills. | After adding/removing/renaming a skill |
| `.hermes/skills/` | **Generated** pointer files for Hermes Agent. Never hand-edit — run `npm run sync:hermes`. | Never directly; Hermes reads it |
| `.agents/skills/security-audit/` | Cloudflare's multi-phase security audit skill (vendored, MIT, third-party). Invoke via the harness `skill` tool, not by reading files. Excluded from ESLint. **Windows caveat:** `validate-findings.cjs` cannot run here (no `O_NOFOLLOW`/`O_NONBLOCK`) — so guidance/focused reviews work, full audits do not. | A security question, vulnerability review, or explicit audit/pen-test request |
| `.agents/skills/` (frontend set) | 10 third-party frontend/design skills. **Follow the mandatory 3-step workflow in §4.1** — Step 1 `antislop` always, Step 2 exactly one direction skill, Step 3 optional. | Any UI, styling, layout, copy, or design-review work |
| `AGENTS.md` (nested) | Folder-local rules that override/supplement this file. | Before editing files in that folder |

> Folders marked with a nested `AGENTS.md` are **sources of truth for their scope**. Local rules win over this file.

---

## 4. Skills

Skills are self-contained playbooks that load **only when relevant**. This keeps the base context small.

```
.agents/skills/
└── <skill-name>/
    ├── SKILL.md          # frontmatter (name, description) + instructions — ALWAYS read this first
    ├── reference/        # optional deep references, read on demand
    └── scripts/          # optional helper scripts
```

**How to use a skill**

1. Scan the `description` field of every `SKILL.md` frontmatter (cheap — headings only).
2. If a task matches, read that `SKILL.md` and follow it.
3. Pull in `reference/` files only if `SKILL.md` tells you to.
4. If no skill matches, proceed using this file and the docs.

### 4.1 Frontend work — mandatory skill workflow

**Follow these three steps in order for ANY frontend work.** Do not skip Step 1. Do not pick more than one skill in Step 2.

#### Step 1 — Core filter (MANDATORY)

Install and load `antislop` first. Always. No exceptions.

```bash
npx skills add miqdadbadjuber/anti-slop    # if not already at .agents/skills/antislop
```

Load it through the harness `skill` tool, then also load the sub-skills that match the surface you are touching:

| Sub-skill | Load when |
|---|---|
| `antislop-ui` | Any visual/component work |
| `antislop-copywriting` | Writing or editing prose, headlines, CTAs |
| `antislop-human` | Accessibility, contrast, focus, states |
| `antislop-layoutmobile` | Responsive layout, grids, tap targets |
| `antislop-code` | Comment hygiene |

#### Step 2 — Pick ONE direction (never all three)

Choose based on **what you are building**, and load only that one:

| Option | Skill | Use for |
|---|---|---|
| **A — Safest** | `frontend-design` | Landing pages, company profiles, marketing sites |
| **B — Most craft** | `impeccable` | Dashboards, app UI, product surfaces |
| **C — Most varied** | `design-taste-frontend` | Portfolios, creative and expressive sites |

```bash
# A
npx skills add anthropics/skills --skill frontend-design
# B
npx skills add pbakaus/impeccable
# C
npx skills add Leonxlnx/taste-skill --skill design-taste-frontend
```

> **Why only one:** A, B and C all solve the same problem — giving the interface a coherent direction. Loading two or three produces conflicting advice (different palettes, different type scales, different layout philosophies) and burns context. Pick one, commit to it.

If the task genuinely spans two kinds of surface (e.g. a marketing page *and* a dashboard), run them as **separate tasks** with a different direction skill each — not one task with two loaded at once.

#### Step 3 — Optional add-ons (only if you need them)

| Skill | Install when | Skip when |
|---|---|---|
| `ui-ux-pro-max` | You need a reference database: 190+ palettes, 70+ font pairings, UX guidelines, chart types, per-stack patterns | **You already have brand guidelines.** Do not let it override an existing design system. |
| `web-design-guidelines` | You want an accessibility/UX audit — good as a final check before shipping | Mid-build; it is a reviewer, not a direction-setter |

```bash
npx skills add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
```

#### Quick reference

```
Step 1  antislop                    ← always
Step 2  frontend-design   OR        ← exactly one
        impeccable        OR
        design-taste-frontend
Step 3  ui-ux-pro-max     optional  ← only if no brand guidelines
        web-design-guidelines  optional ← final audit before ship
```

**Vendored skills are not uniform.** Some third-party `description` fields do not follow the "Use when…" convention below (e.g. `antislop` says "Load always", `ui-ux-pro-max` describes capabilities). Do not rewrite vendored files — they are overwritten on update. The convention applies to skills **you** author.

### 4.2 Installing & updating skills — read before you run `npx skills`

**`npx skills add` is unreliable on this machine.** Long installs get cut off, leaving a folder that *looks* installed but is empty or missing files. Four separate installs were truncated this way, including one that silently dropped 33 of 62 files. A truncated skill still appears in the skill list, so the failure is invisible until you try to use it.

Rules:

1. **After every install or update, run `npm run verify:skills`.** Exit code 1 means truncated. Do not trust the installer's "Installed N skills" message.
2. **If a skill is truncated, do not re-run the installer repeatedly.** Clone its repo and copy the folder:
   ```bash
   git clone --depth 1 https://github.com/<owner>/<repo>.git "$TEMP/clone"
   cp -r "$TEMP/clone/<skill-dir>" .agents/skills/<name>
   ```
   Then delete the clone and verify again.
3. **Delete the broken folder before reinstalling.** The installer will otherwise write into a half-created directory tree.

**Lockfile state — do not assume `npx skills update` covers everything.** `skills-lock.json` tracks only 8 of the 12 skills: the six `antislop*`, `frontend-design`, and `security-audit`. These four are **not** tracked and will never be updated by the CLI:

| Skill | How it got here | To update |
|---|---|---|
| `design-taste-frontend` | `git clone` + manual copy | re-clone from `Leonxlnx/taste-skill` |
| `impeccable` | `git clone` + manual copy | re-clone from `pbakaus/impeccable` |
| `ui-ux-pro-max` | truncated install, then re-installed | `npx skills add …` then verify |
| `web-design-guidelines` | truncated install, then re-installed | `npx skills add …` then verify |

This is deliberate, not an oversight: pinning these by hand is safer than letting a known-flaky installer rewrite them. Upstream → local folder mapping for all 12 skills is declared in `scripts/verify-skills.cjs` (`DEFAULT_SOURCES`).

**How to create a skill** — copy `.agents/templates/skill-template/` → `.agents/skills/<name>/` and rename. The template lives **outside** `.agents/skills/` on purpose: anything inside that folder is auto-registered as an active skill by every agent, so a placeholder template would pollute the skill list. Every skill must have:

```yaml
---
name: kebab-case-skill-name
description: Use when [specific triggering conditions and symptoms an agent would recognise]
---
```

`description` is the only field scanned before loading — it must describe **when to use** the skill, in third person, starting with "Use when…". Do **not** summarise the workflow there; an agent that reads the process may skip loading the body. Keep it under ~500 characters.

Keep `SKILL.md` under ~150 lines. Move depth into `reference/*.md`.

### Two kinds of skills — check both

| Kind | Lives in | Discovered by |
|------|----------|---------------|
| **Project skills** | `.agents/skills/<name>/SKILL.md` (this repo) | You, by scanning the folder |
| **Global / harness skills** | Runtime-managed, outside this repo (e.g. Superpowers plugin) | The harness's own `skill` tool |

Before concluding "no skill applies", **check the harness's native skill tool** as well as `.agents/skills/`. This repo does not contain the global skills, so scanning the folder alone gives an incomplete answer.

### If your tool has no `skill` tool

Not every agent supports skills natively. **The skills still work** — they are plain Markdown.

1. List `.agents/skills/*/SKILL.md`.
2. Read the `name` and `description` from each frontmatter.
3. Open the `SKILL.md` whose description matches your task, and follow its instructions.
4. Read `reference/` files only when that `SKILL.md` tells you to.

The only loss is automatic discovery and on-demand loading. The instructions themselves are identical.

### Portability — one source of truth, many tools

Every agent reads a different filename. This repo solves it by keeping **`AGENTS.md` as the only source of truth** and making every other file a thin pointer to it:

| Tool | Entry file | Nature |
|---|---|---|
| OpenCode, Codex, Cursor, Antigravity, Aider, Zed, most others | `AGENTS.md` | **Source of truth** |
| Claude Code | `CLAUDE.md` | pointer |
| Gemini CLI | `GEMINI.md` | pointer |
| GitHub Copilot | `.github/copilot-instructions.md` | pointer |
| Cursor | `.cursor/rules/agents.mdc` | pointer |
| Windsurf | `.windsurfrules` | pointer |
| Hermes Agent | `AGENTS.md` (or `~/.hermes/SOUL.md` globally) | **reads `AGENTS.md` directly** |
| Anything without file support | paste `AGENTS.md` manually | — |

**Rules when editing documentation:**

- Change rules **only** in `AGENTS.md` (or the nested `*/AGENTS.md`). Never in a pointer file.
- If you add a new tool, add a pointer file — do not copy content into it.
- Pointers may summarise the folder layout, but must never contradict `AGENTS.md`.

Skills are stored in **one** location (`.agents/skills/`) and are tool-agnostic by design: the `SKILL.md` format is the open `agentskills.io` spec, so the same files work in Claude, Codex, Gemini, Copilot, Antigravity, OpenCode, and anything else that reads the spec.

### Skill discovery per tool — they are NOT all the same

Critical difference. Reading `.agents/skills/` works on most agents, but **Hermes does not**:

| Tool | Where it looks for project skills | Status here |
|---|---|---|
| OpenCode | `.agents/skills/` (verified: all 12 found) | ✅ works as-is |
| Claude Code, Codex, Cursor, Copilot, Antigravity, Gemini CLI | `.agents/skills/` or the `agentskills.io` spec location | ✅ works as-is |
| **Hermes Agent** | **`.hermes/skills/`** — does *not* read `.agents/skills/` | ⚠️ needs the bridge |

**The Hermes bridge** is `.hermes/skills/<name>/SKILL.md` — small pointer files that carry the original frontmatter (so Hermes can index the skill) plus instructions to read the real `.agents/skills/<name>/SKILL.md`. Generated, never hand-edited:

```bash
npm run sync:hermes         # regenerate the bridge
npm run sync:hermes:check   # exit 1 if the bridge drifted
```

Regenerate it **after any skill is added, removed, or renamed**. `npm run verify:skills` fails if the bridge is out of sync.

> **Hermes also requires the project to be a git repository.** Without `.git`, Hermes treats the folder as outside a project and will not surface project-local skills. Run `git init` before using Hermes here.

There is no bridge for OpenCode because none is needed — it reads `.agents/skills/` natively.



When authoring a real skill (not just copying the template), follow the harness's **`writing-skills`** skill if available — it defines validation and testing that this template's frontmatter rules summarise only.

---

## 5. Commands

```bash
npm run dev      # dev server (also regenerates the nextjs-agent-rules block above)
npm run build    # production build — must pass before "done"
npm run start    # serve production build
npm run lint     # ESLint
npx tsc --noEmit # type check only (fast feedback)

npm run verify:skills          # cek integritas skill vs upstream (butuh jaringan)
npm run verify:skills:offline  # hanya cek lokal, tanpa jaringan
npm run sync:hermes            # regenerate bridge .hermes/skills/
npm run sync:hermes:check      # exit 1 kalau bridge tidak sinkron
```

**`verify:skills`** — wajib dijalankan setelah menambah/memperbarui skill. Install skill yang berjalan lama bisa **terpotong** dan menghasilkan folder yang terdaftar tapi tidak lengkap. Skill seperti itu tetap muncul di daftar tapi tidak bisa dipakai. Script ini membandingkan setiap skill dengan repo upstream-nya, mendeteksi folder kosong, file hilang, dan import yang rusak. Exit code 1 = ada masalah.

---

## 6. Definition of done

A task is complete when **all** are true:

- [ ] The requested behaviour works (`npm run dev` smoke test if UI/route changes)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes for anything touching routes, config, or data fetching
- [ ] **Frontend work only:** §4.1 workflow followed — `antislop` loaded, **exactly one** direction skill (A/B/C) chosen, not a mix
- [ ] No unrelated files modified
- [ ] New patterns documented in `docs/CONVENTIONS.md` or the relevant nested `AGENTS.md`
- [ ] New top-level folder added to the **Index map** in this file

---

## 7. Where to record what you learn

| You discovered… | Write it to |
|-----------------|-------------|
| A folder-specific rule | `app/AGENTS.md`, `components/AGENTS.md`, `lib/AGENTS.md`, … |
| A project-wide convention | `docs/CONVENTIONS.md` |
| A structural decision + why | `docs/DECISIONS.md` (append an ADR entry) |
| A repeatable multi-step workflow | a new skill in `.agents/skills/` |

See `docs/CONVENTIONS.md` for the full writing rules.
