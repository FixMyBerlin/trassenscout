---
name: tanstack-start-migration
description: Migrate Next.js apps to TanStack Start. Covers Vite/Nitro setup, isomorphic execution, route loaders with React Query, Server Actions → Server Functions, API routes, and FMC folder conventions. Use when migrating from Next.js to TanStack Start, converting server actions, getServerSideProps, or API routes.
---

**LLM reference:** Fetch [llms.txt](https://tanstack.com/llms.txt) for the TanStack documentation index. Human docs: [Migrate from Next.js](https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js).

# Next.js → TanStack Start Migration

Focus: **mental model shift**, **data handling**, and **routing**. TanStack Start = TanStack Router + Vite (+ optional Nitro for deployment). No App Router RSC model.

After the mechanical migration, apply FMC stack skills: `tanstack-start-app-structure`, `tanstack-start-conventions`, `tanstack-start-auth`.

## Critical mental model (read first)

> TanStack Start is **isomorphic by default**. Components and loaders run on **both** server and client unless you isolate server-only logic in `createServerFn`. This is the **opposite** of Next.js Server Components (server-only by default).

| Next.js habit                          | TanStack Start reality                                     |
| -------------------------------------- | ---------------------------------------------------------- |
| Async server component + `await db...` | **Wrong** — component code runs on client after navigation |
| `'use server'` / `'use client'`        | **Remove both** — use `createServerFn` for server-only     |
| `getServerSideProps` always on server  | Route `loader` runs on server **or** client (soft nav)     |
| Direct DB/fs in loader                 | Wrap in `createServerFn`; loader calls the fn              |

**Loader on client nav:** During client-side navigation, the loader runs in the browser. Any DB, filesystem, or secret access inside the loader must go through a server function (RPC on the client, direct call on the server).

## When to Apply

- Migrating Next.js (App Router or Pages Router) to TanStack Start
- Converting Server Actions → Server Functions
- Replacing `getServerSideProps` / RSC fetch with loaders
- Replacing `pages/api/*` or App Router `route.ts` handlers

## Quick Mapping

| Next.js                            | TanStack Start                                                     |
| ---------------------------------- | ------------------------------------------------------------------ |
| `app/page.tsx` / `pages/index.tsx` | `src/routes/index.tsx`                                             |
| `app/layout.tsx`                   | `src/routes/__root.tsx`                                            |
| `app/posts/[slug]/page.tsx`        | `src/routes/posts/$slug.tsx`                                       |
| `app/posts/[...slug]/page.tsx`     | `src/routes/posts/$.tsx`                                           |
| `app/api/foo/route.ts`             | `src/routes/api/foo.ts` (`server.handlers`)                        |
| `getServerSideProps`               | Route `loader` (+ server fn for server-only I/O)                   |
| Server Actions (`'use server'`)    | `createServerFn` in `*.functions.ts`                               |
| `next/link` `href`                 | `<Link to="..." params={...} />`                                   |
| `next/navigation`                  | `@tanstack/react-router` hooks                                     |
| `metadata` export                  | Route `head` property                                              |
| `middleware.ts`                    | `beforeLoad` (FMC default) or `createMiddleware` in `src/start.ts` |
| `next.config.*`                    | `vite.config.ts`                                                   |
| `process.env`                      | `import.meta.env` (client: `VITE_*`)                               |

See [references/nextjs-to-start-mapping.md](references/nextjs-to-start-mapping.md) for edge cases.

---

## 1. Project Setup (Vite + Nitro)

**Greenfield scaffold** (official):

```bash
bunx create @tanstack/start@latest my-app
```

**Migrating in place** — remove Next.js, install Start stack:

```bash
bun remove next @next/font @next/image
bun add @tanstack/react-router @tanstack/react-start nitro vite @vitejs/plugin-react
bun add -d @tailwindcss/vite tailwindcss   # if using Tailwind v4 + Vite
```

**`package.json` scripts:**

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "bun .output/server/index.mjs"
  }
}
```

**`vite.config.ts`** (minimal):

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(), // before viteReact()
    viteReact(),
    nitro(),
  ],
})
```

**`src/router.tsx`:**

```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true })
}
```

**Package names:** Use `@tanstack/react-start` (not deprecated `@tanstack/start`). Do **not** use Vinxi — Start is a Vite plugin since v1.121.

**FMC layout:** Use default `routesDirectory: 'routes'` under `src/` — not Next.js-style `app/`. See `tanstack-start-app-structure`.

---

## 2. Root layout & pages

**`src/app/layout.tsx` → `src/routes/__root.tsx`**

```tsx
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import appCss from '../styles/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootLayout,
})

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

**`page.tsx` → `index.tsx`** (or `$param.tsx` for dynamic segments):

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <main>...</main>
}
```

**Params:** `Route.useParams()` — not async `params` props. **Search:** `validateSearch` + `Route.useSearch()`.

**Links:** Never interpolate params into `to`. Use typed `params` prop:

```tsx
<Link to="/posts/$slug" params={{ slug: post.slug }}>
  View
</Link>
```

---

## 3. Data: Loaders + Server Functions

### Server-only I/O in loaders

```tsx
// server/posts.functions.ts
import { createServerFn } from '@tanstack/react-start'

export const getAllPostsFn = createServerFn({ method: 'GET' }).handler(async () => {
  return db.post.findMany() // or fs, secrets, etc.
})

// routes/index.tsx — thin route (FMC: component import from @/components/...)
export const Route = createFileRoute('/')({
  loader: () => getAllPostsFn(),
  component: HomePage,
})
```

### FMC: React Query–backed data (preferred for shared/refetchable data)

Do **not** use `useLoaderData` alone for Query-backed data. Loader primes cache; component uses `useSuspenseQuery`:

```tsx
// server/posts/queries/posts.server.ts — *QueryOptions
export const postsQueryOptions = () =>
  queryOptions({ queryKey: ['posts'], queryFn: () => getAllPostsFn() })

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQueryOptions()),
  component: HomePage,
})

// components/pages/PageHome.tsx
function HomePage() {
  const { data: posts } = useSuspenseQuery(postsQueryOptions())
  return ...
}
```

One-off admin data with no invalidation: loader return + `useLoaderData` is fine.

See `tanstack-start-conventions` → router-and-query.md and [loader-data-patterns.md](references/loader-data-patterns.md).

---

## 4. Server Actions → Server Functions

```tsx
// server/profile.functions.ts — FMC: *.functions.ts, export *Fn
import { createServerFn } from '@tanstack/react-start'

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    await db.user.update({ ... })
    return { ok: true }
  })
```

**Call from client:** `await updateProfileFn({ data: { name } })` in `onSubmit` — no `formAction`. Invalidate router or Query after mutations.

**Rules (FMC):** DB/session code in `*.server.ts` with `createServerOnlyFn`; client-callable RPC in `*.functions.ts`. Route files never import `*.server.ts` directly.

See [references/server-functions.md](references/server-functions.md).

---

## 5. API Routes

**Public REST/webhooks** — file route with `server.handlers`:

```ts
// routes/api/upload.image.ts
export const Route = createFileRoute('/api/upload/image')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return Response.json({ ok: true })
      },
    },
  },
})
```

**App-internal calls:** Prefer server functions over REST. API routes: no `validateSearch`; parse with Zod from `request.url` in `GET`. See `tanstack-start-conventions`.

---

## 6. Auth & Middleware

- **FMC default:** Auth redirects in route `beforeLoad` via server functions (not direct session/DB in route files). Skill: `tanstack-start-auth`.
- **Global middleware:** `createMiddleware` in `src/start.ts` for cross-cutting concerns (CSRF, logging). Route-level middleware also available on server functions.

Provider SDKs (Clerk, WorkOS) work at React level; server integration may need Start-specific adapters.

---

## 7. Other migrations

| Next.js                  | TanStack Start                                     |
| ------------------------ | -------------------------------------------------- |
| `next/image`             | Vite assets, `@unpic/react`, or `<img>`            |
| `next/font`              | Fontsource + Tailwind `@theme` in CSS              |
| `next/head` / `metadata` | Route `head` (can use `loaderData`)                |
| RSC async page           | Loader + sync component + `useLoaderData` or Query |
| `generateStaticParams`   | `prerender` in Vite/Start config                   |

Remove all `"use server"` and `"use client"` directives.

---

## 8. Migration Checklist

- [ ] Vite + `@tanstack/react-start` configured; Vinxi/`@tanstack/start` removed
- [ ] `src/routes/__root.tsx` with `<HeadContent />`, `<Scripts />`, `<Outlet />`
- [ ] Pages → file routes; `[param]` → `$param`
- [ ] `src/router.tsx` + generated `routeTree.gen.ts`
- [ ] All server-only I/O wrapped in `createServerFn` / `createServerOnlyFn`
- [ ] Server Actions → `*.functions.ts` with `inputValidator`
- [ ] API routes → `routes/api/*.ts` with `server.handlers` (or server fns)
- [ ] Query-backed UI: `ensureQueryData` in loader + `useSuspenseQuery` in component
- [ ] Thin route files; UI in `components/` (`tanstack-start-app-structure`)
- [ ] Explicit `ssr` on routes (`tanstack-start-conventions`)
- [ ] `process.env` → `import.meta.env`; no `next/*` imports remain
- [ ] Auth via `beforeLoad` + server fns (`tanstack-start-auth`)
- [ ] `bun run dev` — all routes and mutations work on hard refresh **and** client nav
- [ ] E2E smoke: `playwright-skill` — `tests/smoke/`, `VITE_PLAYWRIGHT_ENABLED`, stubbed auth (see tilda-geo `app/tests/`)

---

## References

| Topic                        | File                                                                |
| ---------------------------- | ------------------------------------------------------------------- |
| Concept mapping, file layout | [nextjs-to-start-mapping.md](references/nextjs-to-start-mapping.md) |
| Loaders, loaderDeps, Query   | [loader-data-patterns.md](references/loader-data-patterns.md)       |
| createServerFn, validation   | [server-functions.md](references/server-functions.md)               |

**FMC stack (post-migration):** `tanstack-start-app-structure`, `tanstack-start-conventions`, `tanstack-start-auth`, `playwright-skill` (E2E smoke and patterns). URL state: router `validateSearch` first; skill `nuqs` only for shared libs or legacy patterns.

**External:** [Official migration guide](https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js), [execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model).
