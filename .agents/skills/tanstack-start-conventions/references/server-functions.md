# Server Functions (TanStack Start)

**Official docs:** [Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

**Related:** [execution-model.md](execution-model.md) · [client-server-boundaries.md](client-server-boundaries.md) (file suffixes, `*Fn` naming) · `tanstack-start-auth` (auth inside handlers) · client mutation wrappers: `tanstack-router-conventions` → `references/router-and-query.md#client-mutations`

## createServerFn

Use `.validator()` (Zod schema or function); the client calls it with `{ data }`.

```tsx
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

const schema = z.object({ name: z.string().min(2) })

export const updateNameFn = createServerFn({ method: "POST" })
  .validator(schema)
  .handler(async ({ data }) => {
    await db.user.update({ where: { id: currentUser.id }, data: { name: data.name } })
    return { ok: true }
  })

// caller
await updateNameFn({ data: { name: "Jane" } })
```

Multiple arguments: pass a single object through the validator.

Loaders call `*Fn` directly. In components, non-form calls go through `useMutation` (`mutationFn` is `await deleteItemFn({ data: { id } })`, throw if `{ success: false }`); form submits go through Form `onSubmit`.

## FMC file layout

`*.server.ts` and `*.functions.ts` rules: [client-server-boundaries.md](client-server-boundaries.md).

```
server/profile/
├── queries/getProfile.server.ts
├── mutations/updateProfile.server.ts
└── profile.functions.ts    # updateProfileFn, getProfileFn
```

## Forms and invalidation

- **Forms only** use `onSubmit` -> server fn -> invalidate/redirect. Delete/revoke/import buttons use `useMutation`.
- Pending state: `useTransition` on a native `<form>`; `isSubmitting` with TanStack Form.
- After a mutation call `queryClient.invalidateQueries({ queryKey })` for Query data, `router.invalidate()` for loader-only routes. Where to call them (`onSubmit` vs `onSuccess`): `tanstack-router-conventions` → `references/router-and-query.md#client-mutations`.
- Validation errors: throw structured errors for field-level UI.

## Auth note

Route `beforeLoad` protects the page UX; it does **not** stop direct RPC to a server function. Apply auth checks inside every server function handler that needs it. See `tanstack-start-auth`.
