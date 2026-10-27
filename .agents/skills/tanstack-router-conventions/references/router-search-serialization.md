# Router search serialization (clean share URLs)

TanStack Router's default `stringifySearch` percent-encodes characters that are safe in query values: `"`, `,`, `'`, `(`, `)`, `:`, `;`, `[`, `]`, `{`, `}`, `/`. Parsing works, but share links read `answers=%7B%22sidepath%22%3A%22yes%22%7D` instead of readable text.

**Primary reference:** `osm-traffic-sign-tools` -> `routerSearch.ts`. Map viewport: [map-search-param.md](map-search-param.md). Map `<Map>` sync: `react-map-gl` -> `map-url-state.md`.
**Official:** [custom search param serialization](https://tanstack.com/router/latest/docs/framework/react/guide/search-params#custom-search-param-serialization)

## Required `router.tsx` setup

Every FMC app **must** wire `parseSearch` / `stringifySearch` in `createRouter`, even before any param needs special encoding.

```ts
import { createRouter } from "@tanstack/react-router"
import { routerSearch } from "@/shared/routing/routerSearch" // or feature-local path

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    trailingSlash: "never",
    parseSearch: routerSearch.parse,
    stringifySearch: routerSearch.stringify,
    // …context, defaultPreload, error/pending components, Query integration
  })
  return router
}
```

Root route, canonical URLs (pairs with `trailingSlash: 'never'`):

```ts
beforeLoad: ({ location }) => {
  const { pathname, searchStr, hash } = location
  if (pathname.length <= 1 || !pathname.endsWith('/')) return
  const stripped = pathname.replace(/\/+$/, '') || '/'
  throw redirect({
    href: `${stripped}${searchStr}${hash ? `#${hash}` : ''}`,
    replace: true,
  })
},
```

## Layer 1: pretty JSON (all apps)

**Parse** stays the default (`parseSearchWith(JSON.parse)`). **Stringify** runs the default, then decodes safe characters (including `%2F` -> `/`, which keeps `map=13.5/52.4918/13.4261` readable).

```ts
import { parseSearchWith, stringifySearchWith } from "@tanstack/react-router"

const parseSearch = parseSearchWith(JSON.parse)
const stringifySearchDefault = stringifySearchWith(JSON.stringify)

/** Decode safe query-value characters after default stringify. */
const makeSearchPretty = (searchString: string) =>
  searchString
    .replaceAll("%22", '"')
    .replaceAll("%2C", ",")
    .replaceAll("%27", "'")
    .replaceAll("%28", "(")
    .replaceAll("%29", ")")
    .replaceAll("%3A", ":")
    .replaceAll("%3B", ";")
    .replaceAll("%5B", "[")
    .replaceAll("%5D", "]")
    .replaceAll("%7B", "{")
    .replaceAll("%7D", "}")
    .replaceAll("%2F", "/")

export const routerSearch = {
  parse: parseSearch,
  stringify: (search: Record<string, unknown>) => makeSearchPretty(stringifySearchDefault(search)),
}
```

**Keep encoded** (URL breakers): `#`, `&`, `=`, `<`, `>`, `` ` ``, `%`, `+`.

`parseSearchWith(JSON.parse)` may yield **objects or arrays** for JSON-shaped values and **numbers** for bare digits (`q=241` -> `241`). Coerce in Zod (`z.coerce.string()`, preprocess).

## Layer 2: per-param encoding

Each param picks the **smallest** encoding that round-trips and stays readable.

| Shape                   | Encoding                                                         | Example                                  |
| ----------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| Enum / flag             | plain string, omit at default                                    | `qa=actionable`                          |
| List of tokens          | comma-separated, `.split(',')`                                   | `focus=area1,area2`                      |
| Structured but bounded  | domain compact string (custom parse/serialize in Zod preprocess) | `answers=240.sidepath.yes,237.color.red` |
| Small object / array    | TanStack JSON + pretty stringify                                 | `filter={"users":[1,2]}`                 |
| Slash-containing scalar | custom string, no `encodeURIComponent`                           | `map=13.5/52.4918/13.4261`               |
| **Large** nested state  | **jsurl2** (optional)                                            | `notesMode=(folder~7~…)`                 |

Implement per-param logic in the route's `validateSearch` Zod schema (`.preprocess`, `.transform`, dedicated `parseX` / `serializeX`), or in shared `shared/<domain>/searchSchemas.ts` when reused across routes and server redirects. Compact formats must also accept legacy JSON / object shapes from old URLs (osm-traffic-sign-tools `answersParam.ts`).

## Layer 3: jsurl2 (large objects only)

[jsurl2](https://github.com/wmertens/jsurl2) is **not** the default. Use it when a param holds a large nested object and both JSON and a hand-rolled compact format are unwieldy (FMC region modes: `notesMode`, `draw`, legacy `config`). For a route-owned jsurl param:

1. Add the key to `jsurlSearchKeys` (see `tilda-geo-modes` -> `jsurlRouterSearch.ts`).
2. Register the same key in `searchParamsRegistry` (redirect allowlist).
3. Reuse shared `jsurlParse` / `jurlStringify` everywhere (router helpers, server redirects, tests).

```ts
// Only for keys in jsurlSearchKeys: wrap the Layer 1 helpers
export const parseSearchWithJsurl = (searchStr: string) => {
  const search = routerSearch.parse(searchStr)
  for (const key of jsurlSearchKeys) {
    if (typeof search[key] === "string") search[key] = jsurlParse(search[key])
  }
  return search
}
```

## Writing search params (nuqs -> router parity)

`navigate({ search })` does not include nuqs `useQueryState` defaults.

- **History:** pass **`replace: true`** for toggles, filters and viewport updates; push only for real navigation.
- **Clear on default:** set the key to `undefined` or use [`stripSearchParams`](https://tanstack.com/router/latest/docs/framework/react/guide/search-params#transforming-search-with-search-middlewares). Zod defaults only affect reading.
- **Throttle** high-frequency writes (map pans) with `@tanstack/react-pacer` ([map-search-param.md](map-search-param.md)).

Use one route-local `updateSearch` wrapper so setters compose from fresh `prev` and `undefined` deletes keys:

```ts
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import type { RegionSearch } from "@/shared/regionen/regionSearchSchemas"

const regionRouteApi = getRouteApi("/regionen/$regionSlug")

type NavigateOptions = {
  replace?: boolean
}

export const useRegionSearchNavigation = () => {
  const search = regionRouteApi.useSearch()
  const navigate = useNavigate({ from: "/regionen/$regionSlug" })

  const updateSearch = (
    partial: Partial<RegionSearch> | ((prev: RegionSearch) => Partial<RegionSearch>),
    options?: NavigateOptions,
  ) => {
    void navigate({
      search: (prev) => {
        const updates = typeof partial === "function" ? partial(prev) : partial
        const next: Record<string, unknown> = { ...prev }

        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined) {
            delete next[key]
          } else {
            next[key] = value
          }
        }

        return next as RegionSearch
      },
      replace: options?.replace,
    })
  }

  return { search, updateSearch, navigate }
}
```

## Rules

1. `router.tsx` always sets `parseSearch` / `stringifySearch` (at least Layer 1).
2. Smallest encoding per param; jsurl only when size demands it.
3. Never `encodeURIComponent` custom serialize output (`map`, compact strings, jsurl).
4. Zod owns validation: coerce router JSON quirks and legacy shapes.
5. Same parse/serialize helpers in routes, redirect builders, export links and tests.
6. Every preserved query key goes in `searchParamsRegistry` (or app equivalent) for redirect normalization.

## Tests

- Pretty stringify keeps `["foo","bar"]` and `{"a":1}` readable; round-trips through `parse` + `stringify`.
- Per-param compact formats round-trip and accept legacy JSON / object shapes.
- Map slashes readable; legacy `%2F` still parses.
- jsurl keys use `(` / `!` syntax; non-jsurl params unchanged.
- Broken input: prefer Zod `.catch()` / tolerant parse over throwing in router helpers.
