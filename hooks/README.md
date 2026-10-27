# hooks/

Client-side React hooks.

Every hook file starts with `"use client"` — hooks only run in client components.

## Rules

- File `use-kebab-case.ts`, export `useCamelCase`.
- Return a stable, typed shape. Avoid returning anonymous objects with implicit inference at the call site.
- Clean up effects (event listeners, timers, subscriptions).
- No business logic here — extract it to `lib/` and call it from the hook.
