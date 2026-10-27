---
name: tanstack-router-conventions
description: >-
  TanStack Router conventions for FixMyBerlin/FMC (SPA or Start): validateSearch
  with Zod, parseSearch/stringifySearch for clean share URLs, map=zoom/lat/lng
  search param, loader + React Query patterns, typed Link/params, and TanStack
  devtools. Use when scaffolding a Vite + TanStack Router SPA, wiring router.tsx
  search serialization, route search params (including map viewport URLs),
  loaders, Query integration, or client mutations (useMutation vs Form
  onSubmit) — without TanStack Start server/SSR topics.
---

# TanStack Router conventions

Stack conventions for **TanStack Router** apps (Vite SPA or the router layer of TanStack Start). Start-only topics (`createServerFn`, `.server.ts` / `.functions.ts`, selective SSR, RSC, API `server.handlers`) belong to `tanstack-start-conventions`; auth `beforeLoad` to `tanstack-start-auth`.

## Which file for which task

| Task                                                                                      | Read                                                                        |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `router.tsx` search serialization, share URLs, per-param encodings, jsurl, `updateSearch` | [router-search-serialization.md](references/router-search-serialization.md) |
| `?map=zoom/lat/lng` viewport param                                                        | [map-search-param.md](references/map-search-param.md)                       |
| Zod `validateSearch` / path params on UI routes                                           | [params-search-ui-routes.md](references/params-search-ui-routes.md)         |
| Loaders, Query options, derived data, mutations, router defaults                          | [router-and-query.md](references/router-and-query.md)                       |
| Typed hooks, `from`, `Register`                                                           | [router-typescript.md](references/router-typescript.md)                     |
| Devtools panel                                                                            | [devtools.md](references/devtools.md)                                       |

## Non-negotiable rules

- **Validation:** Zod 4 for path params and UI search; export the search schema when reused outside the route; types from `Route.useSearch()`, no manual casts.
- **Search URLs:** `parseSearch` + `stringifySearch` (pretty JSON) in `router.tsx`, `trailingSlash: 'never'` plus a root trailing-slash redirect.
- **Map URL:** `?map=zoom/lat/lng` via shared `parseMapParam` / `serializeMapParam`; never `encodeURIComponent` the value.
- **jsurl:** only for large nested objects, via `jsurlParse` / `jurlStringify`.
- **Query-backed UI:** loader primes the cache, component uses `useQuery` / `useSuspenseQuery`, not `useLoaderData` alone.
- **Devtools:** `TanStackAppDevtools` in `components/shared/devtools/`.

## Quick decisions

- **Loader vs Query:** shared, invalidatable, multi-route data -> `*QueryOptions` + `ensureQueryData` in loader + `useSuspenseQuery`. One-off page data -> loader return + `useLoaderData`.
- **Multi-query joins:** prefer a server/API join; else compose in a wrapper hook ([derived data](references/router-and-query.md#derived--combined-query-data)).
- **Search writes:** `replace: true` for filters, toggles and viewport; `undefined` clears a key; route-local `updateSearch` wrapper.
- **Form vs mutation:** non-form actions -> `useMutation`; form submits -> TanStack Form `onSubmit` ([mutations](references/router-and-query.md#client-mutations)).

## Related skills

| Topic                        | Skill                        |
| ---------------------------- | ---------------------------- |
| TanStack Start (SSR, server) | `tanstack-start-conventions` |
| Auth / session (Start)       | `tanstack-start-auth`        |
| Zustand                      | `zustand-state-management`   |
| URL state without the router | `nuqs`                       |
| React TS / Compiler          | `react-dev`                  |
| Map component + URL sync     | `react-map-gl`               |
