# App structure (`src`)

Portable layout for `app/src` (or equivalent) in TanStack Start projects. For project-specific paths, use the repo's local `docs/` file. For stack rules (`.server.ts`, loaders, SSR), see [client-server-boundaries.md](client-server-boundaries.md).

## Top-level folders

| Folder        | Purpose                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `components/` | All React/JSX — route files never define components                      |
| `routes/`     | Route definitions only (thin: `Route` config + single component import)  |
| `shared/`     | Isomorphic modules — Zod schemas, URL search, pure utils (no DB/secrets) |
| `server/`     | Server-only `*.server.ts`, `*.functions.ts`, `*QueryOptions.ts`          |
| `data/`       | Optional static assets (GeoJSON, JSON, etc.)                             |

Plus root files such as `router.tsx`. Prefer `shared/` for isomorphic code, `server/` for RPC/DB, or `components/shared/` for cross-cutting React UI — not a vague top-level `lib/`.

## Root route and document shell

Real implementations (copy from there, do not re-invent): tilda-geo `app/src/routes/__root.tsx` + `app/src/components/layouts/LayoutRoot.tsx` ([GitHub](https://github.com/FixMyBerlin/tilda-geo/tree/main/app/src)); Trassenscout `src/routes/__root.tsx` (+ `components/shared/layouts/`).

The route file owns router config; `LayoutRoot` owns `<html>` / `<body>` / providers / `<Outlet />` / `<HeadContent />` / `<Scripts />`. App chrome (header, footer, devtools) lives in `LayoutRoot` or child layouts, not in `__root.tsx`.

`routes/__root.tsx`:

- `createRootRouteWithContext<{ queryClient: QueryClient }>()` with `ssr: true`.
- `beforeLoad`: trailing-slash redirect (`trailingSlash: 'never'`; keep search + hash). Trassenscout also calls `endpointAuth.public(...)` here.
- `head()`: default meta/links (inline `APP_META` in tilda-geo, `resolveRootHead(matches)` in Trassenscout for 404 metadata). Child routes override via their own `head()`. Map-heavy apps add `viewport-fit=cover`.
- `component: LayoutRoot` - single import, **no inline `<html>` in the route file**.

FMC defaults:

| Piece                      | Convention                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `lang`                     | `de` for FixMyBerlin public apps                                                          |
| CSS                        | Global stylesheet imported in root `head()` via `?url` (path under `components/layouts/`) |
| Query                      | `useRouteContext({ from: '__root__' })` -> same `queryClient` as router context           |
| `<Scripts />`              | End of `<body>`                                                                           |
| `suppressHydrationWarning` | On `<body>` when needed (tilda-geo map routes)                                            |
| Portal root                | Trassenscout: `<div id="headlessui-portal-root" />` before `<Scripts />` (Headless UI)    |

**Index and param routes:** `/` -> `routes/index.tsx`; dynamic segments use `$param` (e.g. `posts.$slug.tsx`). Read params with `Route.useParams()`.

## `components/` folder standards

| Subfolder   | Purpose                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------- |
| `layouts/`  | All `Layout*.tsx` route shells **and** shared chrome (Header, Footer, `global.css`, assets) |
| `pages/`    | `Page*.tsx` for the `_pages` route group (legal, docs, settings, …)                         |
| `home/`     | `Page*.tsx` for the `_home` route group                                                     |
| `<domain>/` | Feature pages (`regionen/`, `admin/`, …) — `Page*.tsx` only; layouts stay in `layouts/`     |
| `shared/`   | Reusable UI, providers, hooks — not route layouts or document chrome                        |

Route files import layouts from `@/components/layouts/...` only. See `components/layouts/README.md` in apps that ship it for the layout tree.

## Routes: thin, no inline UI

- Route files export `createFileRoute` config: `beforeLoad`, `loader`, `head`, `component`.
- **`component`** is always one import from `@/components/...` — no inline components or heavy UI in route files.
- Route files call server logic only via server functions in `loader` / `beforeLoad` ([client-server-boundaries.md](client-server-boundaries.md)).

## Components: Layout vs Page

- **Layouts:** `Layout*.tsx` in **`components/layouts/`** — route shell, providers, outlet for child page. `LayoutRoot` is the document shell (`html`/`body`, app header/footer). Devtools: `tanstack-router-conventions` → `references/devtools.md`.
- **Pages:** `Page*.tsx` — actual screen content, colocated with the feature domain (`components/pages/`, `components/regionen/`, …).
- **Deliberate asymmetry:** Route segments may use `_segment` for grouping while `components/` uses a readable folder name (e.g. route `_pages` → `components/pages/` for pages, `components/layouts/LayoutPages.tsx` for the layout).

## Server folder per domain

Under `server/<domain>/`:

- `queries/*.server.ts` — read paths
- `mutations/*.server.ts` — writes
- `*.inputSchemas.ts` — server-only validation extensions (may import from `shared/<domain>/schemas`)
- `<domain>.functions.ts` — `createServerFn` exports consumed by routes/components

Domain Zod and URL search schemas live in `shared/<domain>/` (or `shared/<topic>/` for cross-cutting helpers). See [client-server-boundaries.md](client-server-boundaries.md).

## URL state (search params)

Owned by skill **`tanstack-router-conventions`** (`validateSearch`, `router.tsx` `parseSearch` / `stringifySearch` + `trailingSlash: 'never'`, `?map=zoom/lat/lng`).

- **API routes:** no route-level `validateSearch` — [params-search-api-routes.md](params-search-api-routes.md).
- **Search schema placement** (keep `routes/` for route files only — no `-` prefixed colocated helpers):
  - **Route-only:** inline `const …SearchSchema = z.object({ … })` in the route file.
  - **Shared** (route + `navigate({ search })`, components, or multiple routes): `shared/<domain>/searchSchemas.ts`, or `shared/routing/` for cross-cutting params (e.g. back links). Not `*.server.ts` — routes and components import from `shared/`.
- Colocate search hooks under `components/` when they wrap `Route.useSearch()` + `navigate({ search })`.

No nuqs in TanStack Router apps; use route search params. Skill `nuqs` is for Vite apps without TanStack Router.

## Client state (Zustand)

- One concern per `{domain}-store.ts` next to the feature; export **custom hooks only**, not the raw `use*Store` from `create`.
- Patterns: skill `zustand-state-management`.

## Route file naming

- **Folders** for major groups (`admin/`, `api/`, feature areas).
- **Dot notation** for flat lists: `api/export.$id.ts`, `admin/items.$id.edit.tsx`.

## Tests

- **Unit/integration:** colocated `*.test.ts` / `*.test.tsx` next to source; Vitest from app root.
- **E2E:** `tests/*.spec.ts` (Playwright) at app level.
- Keep processing/backend tests in their own package if monorepo.

## Emails (optional)

If using React Email: `src/emails/` with templates; shared pieces in `_templates/` / `_utils/` (underscore prefix so preview tools skip them).
