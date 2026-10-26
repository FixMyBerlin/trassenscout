# TanStack Start — Server Components (RSC)

> **Experimental.** The RSC API may see refinements. Not enabled by default in FMC apps today.

Server Components render React on the server and stream to the client. Heavy deps stay out of the client bundle; data fetching and sensitive logic stay server-side.

**Official docs:** [Server Components](https://tanstack.com/start/latest/docs/framework/react/guide/server-components)

**Related:** [client-server-boundaries.md](client-server-boundaries.md) (where RSC code lives) · [selective-ssr.md](selective-ssr.md) (pairing with `ssr`)

---

## When to use RSC

Default FMC data/UI flow is isomorphic loaders + `createServerFn` + React Query ([execution-model.md](execution-model.md), `tanstack-router-conventions` → `references/router-and-query.md`). Reach for RSC when you need:

- Heavy server-only rendering (markdown, syntax highlighting) without bloating the client bundle
- Server-rendered UI composed with client interactivity via **slots**
- Progressive streaming of server-rendered widgets

RSC is **not** async server components in route files. Create UI in `*.functions.ts` (`createServerFn`), return through the route `loader`, render as `{Renderable}` or `<CompositeComponent src={...} />`.

---

## Setup

FMC TanStack Start apps use **Vite** (e.g. [tilda-geo `app/vite.config.ts`](https://github.com/FixMyBerlin/tilda-geo/blob/main/app/vite.config.ts)): `nitro`, `tailwindcss`, `tanstackStart`, `viteReact({ compiler: true })` with peer `oxc-transform-react`. **Not Rsbuild.**

RSC is additive on that baseline. Follow the official [**Setup → Vite**](https://tanstack.com/start/latest/docs/framework/react/guide/server-components#setup) steps (`@vitejs/plugin-rsc`, enable `rsc` in `tanstackStart`, add `rsc()`). In FMC configs, keep plugin order: existing plugins → `tanstackStart({ rsc: { enabled: true } })` → `rsc()` → `viteReact({ compiler: true })`. Requirements: React 19+, Vite 7+.

---

## Official docs - read there, not here

All sections of [Server Components](https://tanstack.com/start/latest/docs/framework/react/guide/server-components):

- Helpers (`renderServerComponent`, `createCompositeComponent`): `#quick-start`
- Slot types (`children`, render props, component props): `#passing-props-and-composition`
- Router / Query caching, `structuralSharing: false`, invalidation: `#caching`
- `ssr: 'data-only'` / `ssr: false` with RSC: `#combining-with-selective-ssr`
- Parallel fetches, bundling, streaming, generators: `#advanced-patterns`
- Route vs widget errors: `#error-handling`
- `React.cache`, `Link`, CSS: `#tips`
- Slot opacity, serialization rules, experimental status: `#rules-and-limitations`, `#current-status`
- `renderToReadableStream`, `createFromFetch`: `#low-level-flight-stream-apis`

---

## FMC pairing notes

### Caching with Query

Use the FMC loader + Query pattern from `tanstack-router-conventions` → `references/router-and-query.md`. RSC adds one constraint on top of official [Caching → TanStack Query](https://tanstack.com/start/latest/docs/framework/react/guide/server-components#tanstack-query): **`structuralSharing: false`** on any `*QueryOptions` that cache RSC values.

### Selective SSR

Pair RSC loaders with route `ssr` — FMC defaults and map-heavy patterns in [selective-ssr.md](selective-ssr.md#server-components--selective-ssr). Official examples: [Combining with Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/server-components#combining-with-selective-ssr).

### Error handling

Route-level loader failures → route `errorComponent` ([client-server-boundaries.md](client-server-boundaries.md#error-handling)). Widget-level isolation (deferred promise + `ErrorBoundary` + `Suspense`) → official [Error Handling → Component Level Errors](https://tanstack.com/start/latest/docs/framework/react/guide/server-components#component-level-errors).
