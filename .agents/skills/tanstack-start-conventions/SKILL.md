---
name: tanstack-start-conventions
description: >-
  TanStack Start conventions for FixMyBerlin/FMC: app folder layout, thin routes,
  client/server file suffixes, createServerFn, selective SSR, experimental RSC,
  and API route param/search validation. Requires tanstack-router-conventions for
  validateSearch, search serialization, and loader + Query patterns. Use when
  scaffolding or refactoring Start apps, server functions, SSR, renderServerComponent,
  or API routes under routes/api/.
---

# TanStack Start conventions

Stack conventions for **TanStack Start** apps in this org. **Requires** skill `tanstack-router-conventions` (search params, pretty URLs, loaders + Query, form vs `useMutation`, typed Router TS, devtools) - do not duplicate it here. Pair with `tanstack-start-auth` for auth and session layout.

## Which reference to read

| Task                                                                                                          | File                                                                  |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Scaffold or refactor `app/src` folders, thin routes, Layout/Page naming, tests                                | [app-structure.md](references/app-structure.md)                       |
| Split code between `.server.ts` / `.functions.ts`, import protection, `beforeLoad` vs `loader`, error logging | [client-server-boundaries.md](references/client-server-boundaries.md) |
| Write `createServerFn`, validation, form submit, invalidation                                                 | [server-functions.md](references/server-functions.md)                 |
| Loader or component hits DB/fs/secrets, client-nav bugs                                                       | [execution-model.md](references/execution-model.md)                   |
| Set route `ssr`, debug SSR / hydration, Query dehydration                                                     | [selective-ssr.md](references/selective-ssr.md)                       |
| API route under `routes/api/` (path params, search, POST body)                                                | [params-search-api-routes.md](references/params-search-api-routes.md) |
| Experimental RSC (`renderServerComponent`, `createCompositeComponent`)                                        | [server-components.md](references/server-components.md)               |
| `bun --bun` for Vite + Nitro scripts                                                                          | [local-runtime.md](references/local-runtime.md)                       |

Auth flows: skill `tanstack-start-auth`.

## Non-negotiable rules

| Topic                 | Rule                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Server-only modules   | `*.server.ts` - never imported by routes/components (exceptions: `routes/api/` and handler-only routes without a component); use `createServerOnlyFn` inside |
| Callable from client  | `*.functions.ts` with `createServerFn`; name exports `*Fn`                                                                                                   |
| Public server fns     | `public*.functions.ts` - no global auth middleware; rate-limit/token checks in `.server.ts` (see `tanstack-start-auth`)                                      |
| API route files       | No `server-only` import marker on the route file; server-only logic inside handlers or tree-shaken imports                                                   |
| API search params     | No `validateSearch` on API routes; Zod `safeParse` in `GET` from `request.url`, return 400 JSON on failure                                                   |
| SSR                   | Set `ssr` explicitly on every route; UI default `true`; handler-only API routes `false`; map-heavy UI `'data-only'`                                          |
| Local Bun runtime     | Vite `dev` and Nitro `start`/`preview` use `bun --bun`                                                                                                       |
| Router search / Query | Owned by `tanstack-router-conventions` (`parseSearch` / `stringifySearch`, loader + Query)                                                                   |

## Quick decisions

- **`beforeLoad` vs `loader`:** redirects, auth, light context in `beforeLoad` (not middleware); data fetch / Query priming in `loader`. `beforeLoad` re-runs on every navigation, search-param changes included, so hot routes (map viewport, layer toggles) put redirect/auth/region in the `loader` and keep those params out of `loaderDeps`. Details: [client-server-boundaries.md](references/client-server-boundaries.md).
- **Loader vs Query, form vs mutation:** follow `tanstack-router-conventions` -> `references/router-and-query.md` (`#client-mutations`). On Start, loaders and `mutationFn` call the `*Fn`; server I/O always goes through `createServerFn`.
- **`ssr`:** map/canvas-heavy UI needing server auth/data -> `'data-only'`; handler-only API (`server.handlers`) -> `false`; fully client-first UI route -> `false` (rare).
- **Server components:** opt-in experimental, not the default FMC data path.

## Related skills

| Topic                              | Skill                                                       |
| ---------------------------------- | ----------------------------------------------------------- |
| Router (required)                  | `tanstack-router-conventions`                               |
| Auth / session                     | `tanstack-start-auth`                                       |
| Bun install / nvm                  | `tech-stack` -> bun-install                                 |
| Zustand                            | `zustand-state-management`                                  |
| URL state without TanStack Router  | `nuqs`                                                      |
| Leftover placement after refactors | `unslop-code` Phase 6 -> `references/component-location.md` |
