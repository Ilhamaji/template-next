# types/

Shared TypeScript types.

**Rule:** a type belongs here only when it is imported by **two or more** folders.
Otherwise keep it next to the code that owns it.

Suggested files (create as needed):

| File | Contains |
|---|---|
| `types/env.ts` | Typed `process.env` access |
| `types/<domain>.ts` | Domain models, e.g. `types/user.ts` |

## Example

```ts
// types/user.ts
export type User = {
  id: string;
  email: string;
  name: string | null;
};
```

## Typed env example

```ts
// types/env.ts
function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

export const env = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
} as const;
```
