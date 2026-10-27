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

## 004 - Keep the heavy frontend skill rules (AI-agent-only scope)

- **Date:** 2026-10-28
- **Status:** accepted
- **Context:** A review argued that requiring `antislop` plus exactly one direction skill for *every* frontend task is heavy — changing one button shouldn't need two skill loads. The question was scoped deliberately: is this template for AI-agent workflows, or a general-purpose Next.js starter?
- **Decision:** Keep the mandate. This template is scoped to **AI-agent workflows**, where a consistent anti-slop baseline plus one coherent design direction is the product. It is not a lightweight general starter, and should not be stripped down to become one.
- **Consequences:** Heavier per-task ritual, and roughly 8.9 MB of vendored skills. In exchange, output stays coherent across agents and sessions. If a lightweight Next.js starter is ever needed, fork it — do not weaken §4.1 here.

## 005 - Self-host fonts instead of next/font/google

- **Date:** 2026-10-28
- **Status:** accepted
- **Context:** `next/font/google` downloads font files at build time, so the build fails on restricted or offline networks. Runtime was never affected (files are self-hosted in the output).
- **Decision:** Use `next/font/local` with Geist TTFs committed in `app/fonts/` (SIL OFL 1.1, license included). Weights 400/500/600 for sans, 400 for mono. System fonts were rejected as redistribution-unsafe (proprietary).
- **Consequences:** Build is fully offline-capable and reproducible. Adds ~520 KB of font files to the repo, and font updates become a manual file swap rather than a package bump.

## 006 - Vitest for tests, with pinned toolchain floors

- **Date:** 2026-10-28
- **Status:** accepted
- **Context:** The repo had no test runner; only an ad-hoc `check-cn.mjs` script. Vitest 5 and jsdom 30 impose Node floors tighter than Next.js and Next's own `engines` field, so `engines` must reflect the strictest consumer or `npm run test` fails for users who pass the version check.
- **Decision:** Vitest 5 + Testing Library + jsdom. `engines` is `^22.22.2 || ^24.15.0 || >=26` (jsdom's floor, the strictest). `.nvmrc` pins 24 for CI. Tests exclude `.agents/**` and `.hermes/**` so vendored skills are never collected.
- **Consequences:** `engines` rejects Node 20/23/25, which is noisy but truthful. Adding a dependency may silently raise the floor again — re-check `engines` whenever the test toolchain changes.
