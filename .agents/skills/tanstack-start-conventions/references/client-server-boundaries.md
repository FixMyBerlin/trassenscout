# TanStack Start - Client vs. Server Boundaries

How server-only and client-only code stay in the right bundles: file naming, import protection, `beforeLoad` vs `loader`.

**Related:** [execution-model.md](execution-model.md) · [server-functions.md](server-functions.md) · [selective-ssr.md](selective-ssr.md) · Official: [TanStack Start](https://tanstack.com/start/), [Import Protection](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection)

## Folder `/server`

All server-only modules and RPC (server function) handlers.

## Filename conventions

### `/server/*.server.ts` - server-only modules

- Use `@tanstack/react-start/server` APIs (`getRequestHeaders()`, `getRequest()`, `setCookie()`), the DB, or other server-only APIs.
- Never imported by route files or components. Two exceptions: API route files under `routes/api/`, and handler-only routes outside it (route files exporting only server handlers and no component, e.g. tilda-geo `src/routes/mcp.ts`). Both may statically import `*.server.ts` modules used only inside handlers.
- Use **`createServerOnlyFn`** for any exported callable (never `createServerFn`).
- We do _not_ use `import '@tanstack/react-start/server-only'`.

### API routes and handler-only routes - no server-only marker

`routeTree.gen.ts` imports every route file, so route modules (including `routes/api/*`) load in the client bundle. A server-only marker there makes import protection fail the **build**. `server.handlers` still run only on the server. Keep these files free of the marker and import server-only code only where the bundler tree-shakes it (used only inside the handler), or import it inside the handler.

No broad `importProtection.ignoreImporters` (e.g. `['**/routes/**', '**/server/**']`) in Vite config: the plugin checks after tree-shaking, so imports used only in handler code are pruned and not reported. API routes, handler-only routes and `*.functions.ts` can import such `*.server.ts` modules without overrides.

### `/server/*.functions.ts` - client-callable server fns

Files exporting `createServerFn` that routes or components import. Not `*.server.ts` (client could not import) and not `*.client.ts` (they run in both environments).

- **Names:** all `createServerFn` / `createServerOnlyFn` use **`functionNameFn`** (e.g. `getRegionPageLoaderFn`).
- **Public (unauthenticated):** `public*.functions.ts` (e.g. `publicSurveys.functions.ts`). No auth middleware or `requireAuth` unless the handler validates a public token/session pair; global auth middleware is not the FMC pattern. See `tanstack-start-auth` → `references/auth.md` §5.

### `routes/` is routes only

No `-` prefixed colocated helpers. Query options: `server/<domain>/queries/` or `*QueryOptions.ts` in the domain folder. Search schemas: `shared/<domain>/searchSchemas.ts` or `shared/routing/` (shared), inline `const` in the route file (route-only). Routes and components may import `searchSchemas.ts`, never `*.server.ts`.

## Route files: no server-only code

Route files call server Fns in `loader` / `beforeLoad`; they cannot import `getRequestHeaders` or the DB directly (except API route files, where handler code runs on the server). They may call several server Fns, redirect, or `fetch` external APIs.

## `beforeLoad` vs `loader`

- **`beforeLoad`:** redirects (URL normalization, auth redirect), auth/authorization, route context (e.g. `isAuthorized`, `region`). Keep it light.
- **`loader`:** page data and cache priming; may use `context` from `beforeLoad`. Query-backed data: `tanstack-router-conventions` → `references/router-and-query.md`; otherwise return serializable data for `useLoaderData()` (e.g. admin pages).

### `beforeLoad` re-runs on every navigation

`beforeLoad` is **not** gated by `loaderDeps`: it re-runs on every navigation to the route, **including search-param-only changes** (map pan writing `?map=`, layer toggle, feature selection). The `loader` re-runs only when `loaderDeps` or path params change ([docs](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#using-loaderdeps-to-access-search-params)). Map URL format: `tanstack-router-conventions` → `references/map-search-param.md`.

So any server round-trip in `beforeLoad` runs on every search-param change, turning client-only interactions into server requests and possibly flashing `pendingComponent` / remounting the map on a spurious redirect.

**Rule for hot routes (map pages, any client-only search state):** put redirect + auth + region resolution in the **`loader`** and keep client-only params **out of `loaderDeps`**. The loader then runs on entry / path change / listed params (e.g. `qa`), not on pans or toggles. Decouple `pendingComponent` (and any `useRouterState` / `useRouteContext` reader) from `beforeLoad` context: read `region` from `loaderData`. Reference: `routes/regionen/$regionSlug/route.tsx` in tilda-geo. Ordinary routes keep the light `beforeLoad` default.

Use **`beforeLoad`, not request middleware**, for route redirects and layout auth (pathless layout routes make open vs protected URLs obvious; Trassenscout's lint enforces this). Function middleware (`createMiddleware({ type: 'function' })`) is a server-function data-boundary topic only, not a replacement for layout `beforeLoad`. See `tanstack-start-auth` → `references/auth.md` §5 and `references/endpoint-auth-lint.md`. API route handlers and server modules needing the current user must receive the request headers and pass them to session helpers.

## Error handling

Set a router `defaultErrorComponent`; override `errorComponent` per route for domain-specific messaging. Root React Error Boundary for render errors.

Logging: `createIsomorphicFn()` with `.server()` / `.client()` branches so logs are prefixed `[SERVER ERROR]` / `[CLIENT ERROR]`; use in Error Boundary `componentDidCatch` and route error components. See [Error Boundaries](https://tanstack.com/start/latest/docs/framework/react/guide/error-boundaries).
