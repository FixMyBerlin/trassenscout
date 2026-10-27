# TanStack Router: path params & search — UI routes

Validation uses **Zod 4** everywhere in FMC TanStack Router apps (version: see the app's `package.json`). Typed `search` is available in `loaderDeps`, `beforeLoad`, `loader` and `Route.useSearch()`.

## One schema per route

Define each route's search schema **once**. Never duplicate search shapes as hand-written `type` aliases or `as { … }` casts.

**Placement:** inline `const` in the route file when only that route uses it. When imported elsewhere (route `validateSearch` plus `navigate({ search })`, components, shared helpers), export it from `shared/<domain>/searchSchemas.ts` (or `shared/routing/` for cross-route helpers). Do **not** colocate non-route files under `routes/` (no `-` prefixed helpers).

- Route: `validateSearch: itemSearchSchema` (Zod 4 is Standard Schema; **no** `@tanstack/zod-adapter` / `zodValidator()`; no `(search) => schema.parse(search)` wrapper).
- Type: `type ItemSearch = z.infer<typeof itemSearchSchema>`, exported only when imported elsewhere.
- Components: `Route.useSearch()` in the route file, `getRouteApi('/path').useSearch()` elsewhere, never `useSearch({ strict: false }) as …`.
- Revalidate elsewhere with the **same schema object**: `itemSearchSchema.safeParse(raw)`; `z.flattenError()` for user-facing errors.

Always use `.default()` (so `<Link search>` does not need every key) plus `.catch(fallback)` (invalid values recover instead of erroring):

```ts
const itemSearchSchema = z.object({
  tab: z.enum(["overview", "notes"]).default("overview").catch("overview"),
  page: z.coerce.number().int().positive().default(1).catch(1),
})
```

## Example route

Docs: [Validate search](https://tanstack.com/router/latest/docs/how-to/validate-search-params#quick-start) · [Search params guide](https://tanstack.com/router/latest/docs/framework/react/guide/search-params) · [`loaderDeps` + search](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#using-loaderdeps-to-access-search-params)

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

// Always Zod for dynamic path segments.
const itemParamsSchema = z.object({
  itemId: z.coerce.number().int().positive(),
})

const itemSearchSchema = z.object({
  tab: z.enum(["overview", "notes"]).default("overview").catch("overview"),
})

export const Route = createFileRoute("/items/$itemId")({
  // Zod throws -> route error / errorComponent.
  params: {
    parse: (raw) => itemParamsSchema.parse(raw),
  },
  validateSearch: itemSearchSchema,
  // Loader deps on search so loaders re-run when validated search changes.
  loaderDeps: ({ search: s }) => ({ tab: s.tab }),
  loader: async ({ params, search }) => {
    return { label: `Item ${params.itemId} (${search.tab})` }
  },
  component: ItemPage,
})

function ItemPage() {
  // In child files: getRouteApi('/items/$itemId').useParams() / .useSearch()
  const { itemId } = Route.useParams()
  const { tab } = Route.useSearch()
  const data = Route.useLoaderData()
  return (
    <div>
      {data.label} — {itemId} / {tab}
    </div>
  )
}
```

Pretty share URLs: [router-search-serialization.md](router-search-serialization.md).
