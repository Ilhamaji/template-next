# lib/ — logic rules

Scope: everything under `lib/`. Supplements the root `AGENTS.md`.

## Structure

```
lib/
  utils.ts        # tiny shared helpers (cn, formatters)
  <domain>/       # feature logic: data access, validation, actions, mappers
```

- Server-only modules (DB clients, secrets) must start with `import "server-only";`.
- Server Actions: `lib/<domain>/actions.ts` with `"use server"` as the first statement.

## Rules

- **No React.** No JSX, no hooks, no component imports. `lib/` must be importable from anywhere.
- **Pure where possible.** A function that touches the network, disk, or clock should be obvious from its name (`fetchUser`, `readConfig`, `nowIso`).
- **Typed boundaries.** Validate external input at the edge; return domain types inside.
- Export named functions. No default exports.
- No module-level mutable state (it leaks across requests in a server runtime).
- Throw typed errors for expected failures; don't return `null` where a distinct error is more informative.
- `utils.ts` stays small — if a helper grows, move it into `lib/<domain>/`.

## Naming

| Kind | Pattern | Example |
|---|---|---|
| Data access | `get*` / `fetch*` | `getUserById` |
| Mutation | `create*` / `update*` / `delete*` | `updateProfile` |
| Predicate | `is*` / `has*` | `isEmailVerified` |
| Transform | `to*` / `from*` / `parse*` | `toUserDTO` |
| Format | `format*` | `formatDate` |

## Checklist

- [ ] No React / component imports
- [ ] No module-level mutable state
- [ ] Server-only modules import `server-only`
- [ ] Inputs validated at the boundary
- [ ] Types exported from `types/` only if shared by 2+ folders
