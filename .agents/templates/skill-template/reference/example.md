# Feature walkthrough (example skill)

Example of a *reference* file. Loaded only when `SKILL.md` tells the agent to.

## Task
Add a "notes" feature: list notes at `/notes`, create a note via a server action.

### 1. Types — `types/note.ts` (shared) or `lib/notes/types.ts` (local)

```ts
export type Note = { id: string; title: string; createdAt: string };
```

### 2. Logic — `lib/notes/queries.ts`

```ts
import "server-only";

export async function getNotes(): Promise<Note[]> {
  // replace with the real data source
  return [];
}
```

### 3. Action — `lib/notes/actions.ts`

```ts
"use server";

export async function createNote(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required" };
  // persist, then revalidatePath("/notes")
}
```

### 4. UI — `app/notes/page.tsx`

```tsx
import { getNotes } from "@/lib/notes/queries";
import { NoteList } from "@/components/notes/note-list";

export default async function NotesPage() {
  const notes = await getNotes();
  return <NoteList notes={notes} />;
}
```

### 5. Verify

```bash
npx tsc --noEmit && npm run lint && npm run build
```

### 6. Record

- New folder? Add it to the **Index map** in `AGENTS.md`.
- New pattern? Append to `docs/CONVENTIONS.md`.
