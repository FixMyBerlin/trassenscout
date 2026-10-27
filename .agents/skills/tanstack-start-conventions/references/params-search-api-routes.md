# TanStack Start: path params & search - API (server) routes

Validation uses **Zod 4** everywhere in FMC Start apps. Pin `zod@4.4.3`.

**UI routes** (`validateSearch`, typed `Route.useSearch()`): skill `tanstack-router-conventions` → `references/params-search-ui-routes.md`.

Server route handlers are plain `Request` handlers: they receive **`request`**, **`params`**, **`context`** only - there is **no** validated `search` object on `GET`.

**When to use which:** app-internal reads/writes -> `createServerFn` ([server-functions.md](server-functions.md)). API routes -> public REST, webhooks, third-party callbacks, Better Auth handlers under `routes/api/`.

## Rules

- **Path params (`$segment`):** same Zod `params.parse` as UI routes; read via `GET: ({ params })`. API routes have no custom error component, so a failing `params.parse` returns a framework error response, not your JSON. If callers need custom JSON for bad params, validate inside `GET` too.
- **Search (`?`):** do **not** use `validateSearch` on API routes - failures become framework responses (not your JSON) and validated search does not flow into `GET`. Validate in `GET` with Zod `safeParse` on `request.url` and return a manual 400.
- **`ssr: false`** on every handler-only route ([selective-ssr.md](selective-ssr.md)).
- **POST (webhooks, uploads):** same handler-only pattern; parse `await request.json()` with Zod in the handler.

Docs: [Server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes) · [Handler context](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes#handler-context) · [Dynamic path params](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes#dynamic-path-params)

```ts
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const exportParamsSchema = z.object({ itemId: z.coerce.number().int().positive() })

// Export when the route and `GET` both validate search.
export const exportSearchSchema = z.object({
  format: z.enum(["json", "csv"]).default("json"),
})

export const Route = createFileRoute("/api/items/$itemId/export")({
  ssr: false,
  params: { parse: (raw) => exportParamsSchema.parse(raw) },
  // no validateSearch here
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { itemId } = params
        const rawSearch = Object.fromEntries(new URL(request.url).searchParams)
        const parsed = exportSearchSchema.safeParse(rawSearch)
        if (!parsed.success) {
          return Response.json({ error: z.flattenError(parsed.error) }, { status: 400 })
        }
        return Response.json({ itemId, format: parsed.data.format })
      },
    },
  },
})
```
