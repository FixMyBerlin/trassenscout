# TanStack Start — Selective SSR

Same route `ssr` rules for all FMC Start apps (TILDA, Trassenscout). Loader + Query conventions: `tanstack-router-conventions` → `references/router-and-query.md`; this file covers only Start `ssr` + Query dehydration.

Official: [Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr) · [Router Query integration](https://tanstack.com/router/latest/docs/integrations/query)

## What controls what

- **Route `ssr` (`true` / `'data-only'` / `false`):** whether the component renders on the server and whether `beforeLoad` / `loader` run there.
- **`@tanstack/react-router-ssr-query`:** how QueryClient state is dehydrated/streamed/hydrated. Complementary; used together.

## Route defaults

- **Convention:** always set `ssr` explicitly in route definitions (do not rely on implicit defaults).
- **Default:** full SSR (`ssr: true` behavior).
- **Use `ssr: 'data-only'`:** when a route is mainly browser-only UI (map/canvas-heavy), but you still want server `beforeLoad` / `loader` for redirects/auth/data.
- **Use `ssr: false`:** when both route rendering and route data loading should be client-only on first load; also for **handler-only API routes** (see below).

## API routes (`server.handlers`)

Handler-only route files (no `component`; REST, webhooks, Better Auth, uploads, exports; usually `src/routes/api/**`, TILDA may use flat `api/*.ts`) set **`ssr: false`** explicitly: it documents that the route is outside the React SSR pipeline and avoids accidental server `beforeLoad` / `loader`. `server.handlers` still run on the server. Never `ssr: true` on API-only routes; migrate legacy ones when touched.

## Map-heavy route with `data-only`

e.g. `/regionen/$regionSlug` (TILDA): `ssr: 'data-only'` because the UI is MapLibre/canvas-heavy but server `beforeLoad` / `loader` still do redirect normalization, auth context and `ensureQueryData(...)` cache priming; `@tanstack/react-router-ssr-query` dehydrates/hydrates that cache.

## Operational notes

- Keep `setupRouterSsrQueryIntegration(...)` in `router.tsx`.
- Prefer configuring selective SSR at leaf routes instead of broad parent routes unless all children should inherit that restriction.
- Inheritance only gets stricter (`true` -> `'data-only'` -> `false`), so `ssr: true` on parents is safe; a child cannot be less restrictive than its parent ([docs](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr#inheritance)).
- Ensure data-only routes have a useful route `pendingComponent`, because fallback UI is what is rendered server-side for the first matching non-SSR route.

## Server Components + selective SSR

When using experimental RSC, pair route `ssr` with how the RSC is fetched and rendered:

- **`ssr: 'data-only'`** — loader fetches RSC on the server; route component renders on the client (browser APIs, map shells). Typical FMC map-heavy pattern.
- **`ssr: false`** — loader itself needs browser APIs (e.g. `localStorage`) before creating the RSC.

RSC FMC conventions and official doc links: [server-components.md](server-components.md). Setup, helpers, slots, caching: [TanStack Start Server Components](https://tanstack.com/start/latest/docs/framework/react/guide/server-components).
