# TanStack Router — TypeScript

Docs: [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview) · [llms.txt](https://tanstack.com/llms.txt)

## Typed hooks outside the route file

Shared hooks use `getRouteApi('/path')` (what tilda-geo and trassenscout do), not `strict: false` casts:

```typescript
import { getRouteApi } from "@tanstack/react-router"

const userRouteApi = getRouteApi("/users/$userId")
const { userId } = userRouteApi.useParams()
const { tab } = userRouteApi.useSearch()
```

Inside the route file use `Route.useParams()` / `Route.useSearch()`. Catch-all splat routes (`routes/posts/$.tsx`) expose the remainder as `_splat`.

## Typed `Link`

Never string-interpolate path segments into `to`: use `to="/posts/$slug" params={{ slug }}`.

## Router type registration

Register the router for global link/search inference (app `router.tsx`):

```typescript
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

Search schemas: [params-search-ui-routes.md](params-search-ui-routes.md). Serialization: [router-search-serialization.md](router-search-serialization.md). Loaders and Query: [router-and-query.md](router-and-query.md).
