# Server Functions (TanStack Start)

## createServerFn

Server functions run on the server and are called from the client like async functions. They replace Next.js Server Actions.

**Isomorphic behavior:** On the server, the handler runs directly. On the client (e.g. loader during soft nav), the call becomes a typed RPC request.

**Definition:** Use `.inputValidator()` (not `.validator()`); the client receives a function that expects `{ data: T }`.

```tsx
import { createServerFn } from '@tanstack/react-start'

export const updateNameFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string }) => {
    if (typeof data.name !== 'string' || data.name.length < 2) throw new Error('Invalid name')
    return data
  })
  .handler(async ({ data }) => {
    await db.user.update({ where: { id: currentUser.id }, data: { name: data.name } })
    return { ok: true }
  })
```

**From client:**

```tsx
import { updateNameFn } from '@/server/profile/profile.functions'

await updateNameFn({ data: { name: 'Jane' } })
```

- **method:** `'POST'` for mutations; `'GET'` (or omit) for idempotent reads.
- **inputValidator:** Validate before handler; handler receives `{ data }`.
- **handler:** Async; DB, external APIs, fs. Return serializable value.

## FMC file conventions

| Suffix           | Purpose                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `*.server.ts`    | Server-only modules; use `createServerOnlyFn` for exports — **never** imported by routes/components |
| `*.functions.ts` | `createServerFn` exports (`*Fn` naming); imported by routes and components                          |

Example layout:

```
server/profile/
├── queries/getProfile.server.ts
├── mutations/updateProfile.server.ts
└── profile.functions.ts    # updateProfileFn, getProfileFn
```

Route files call server fns in `loader` / `beforeLoad` — not direct `*.server.ts` imports.

## Validation (Zod)

```tsx
import { z } from 'zod'

const schema = z.object({ name: z.string().min(2), email: z.string().email() })

export const submitFormFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    // data: { name: string; email: string }
  })
```

## Errors

- Throw in handler → client receives error. Use `try/catch` at call site and/or route `errorComponent`.
- For validation errors, throw structured errors for field-level UI.

## Invalidation After Mutations

After a mutation that changes loader/Query data:

- **React Query:** `queryClient.invalidateQueries({ queryKey: [...] })`
- **Router:** `router.invalidate()` for loader-only routes

Call invalidation after `await serverFn(...)` in the same event handler.

## No formAction

Use `onSubmit` → server fn → invalidate/redirect. Optional `useTransition` for pending state.

## Auth note

Route `beforeLoad` protects the page UX; it does **not** stop direct RPC to a server function. Apply auth checks inside every server function handler that needs it. See `tanstack-start-auth`.

## Multiple Arguments

Pass a single object via validator:

```tsx
export const updateItemFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { id: string; name: string }) => input)
  .handler(async ({ data }) => { ... });
```

Call: `updateItemFn({ data: { id: '1', name: 'Foo' } })`.
