# Next.js → TanStack Start Concept Mapping

## Execution model

| Next.js                              | TanStack Start                | Notes                                                       |
| ------------------------------------ | ----------------------------- | ----------------------------------------------------------- |
| Server Components (default)          | Isomorphic components         | All component/loader code can run on client after soft nav  |
| `'use server'`                       | `createServerFn()`            | Remove all `'use server'` / `'use client'`                  |
| `'use client'`                       | Not needed                    | Interactive by default                                      |
| `getServerSideProps` (always server) | Route `loader`                | Loader runs on server **or** client — wrap I/O in server fn |
| App Router async page + fetch        | `loader` + server fn or Query | Never `await db` directly in component                      |

## Data & Rendering

| Next.js                         | TanStack Start                        | Notes                                     |
| ------------------------------- | ------------------------------------- | ----------------------------------------- |
| `getServerSideProps`            | Route `loader` + `createServerFn`     | Serializable return; server fn for DB/fs  |
| `getStaticProps`                | Route `loader` + prerender config     | Or loader + build-time static export      |
| `getStaticPaths`                | File routes (`$param`)                | 404 via `notFound()` in loader            |
| App Router `async` page + fetch | `loader` + `useLoaderData()` or Query | Move fetch out of component               |
| `generateMetadata`              | Route `head`                          | Can use `loaderData` in `head` callback   |
| RSC Server Component            | N/A                                   | Loader for data; component is client-safe |

## FMC data patterns

| Need                    | Pattern                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Shared/refetchable data | `*QueryOptions` in `server/`, `ensureQueryData` in loader, `useSuspenseQuery` in UI |
| One-off admin page      | Loader return + `useLoaderData()`                                                   |
| Auth/redirects          | `beforeLoad` via server fn (not middleware by default)                              |

## Mutations & Server Logic

| Next.js                        | TanStack Start                                           |
| ------------------------------ | -------------------------------------------------------- |
| Server Action (`'use server'`) | `createServerFn({ method: 'POST' })` in `*.functions.ts` |
| `formAction={action}`          | `onSubmit` → `await myFn({ data })` + invalidate         |
| `useFormStatus`                | `useState` / `useTransition` for pending                 |

## API & Server

| Next.js               | TanStack Start                               |
| --------------------- | -------------------------------------------- |
| `pages/api/*`         | `src/routes/api/*.ts` with `server.handlers` |
| App Router `route.ts` | Same — `createFileRoute` + `server.handlers` |
| Internal app calls    | Server functions (preferred over REST)       |

## Routing (file-based)

| Route              | Next.js App Router                 | TanStack Start (FMC)         |
| ------------------ | ---------------------------------- | ---------------------------- |
| Root layout        | `src/app/layout.tsx`               | `src/routes/__root.tsx`      |
| `/`                | `src/app/page.tsx`                 | `src/routes/index.tsx`       |
| `/posts`           | `src/app/posts/page.tsx`           | `src/routes/posts.tsx`       |
| `/posts/[slug]`    | `src/app/posts/[slug]/page.tsx`    | `src/routes/posts.$slug.tsx` |
| `/posts/[...slug]` | `src/app/posts/[...slug]/page.tsx` | `src/routes/posts/$.tsx`     |
| `/api/endpoint`    | `src/app/api/endpoint/route.ts`    | `src/routes/api/endpoint.ts` |

Catch-all splat: access via `Route.useParams()` → `_splat`.

## Config & Env

| Next.js                       | TanStack Start                                             |
| ----------------------------- | ---------------------------------------------------------- |
| `next.config.js`              | `vite.config.ts` + `tanstackStart()` plugin                |
| `postcss.config.*` (Tailwind) | `@tailwindcss/vite` plugin (Vite) or PostCSS (Rsbuild)     |
| `process.env.*`               | `import.meta.env.*`; client: `VITE_*`                      |
| `public/`                     | `public/` (Vite)                                           |
| Rewrites / redirects          | Nitro config, or `beforeLoad` redirect                     |
| `middleware.ts`               | `beforeLoad` (FMC) or `createMiddleware` in `src/start.ts` |

## File Layout (FMC target)

```
src/
├── router.tsx
├── routes/              # thin route files only
│   ├── __root.tsx
│   ├── index.tsx
│   ├── posts.$slug.tsx
│   └── api/
│       └── export.$id.ts
├── components/          # Layout*.tsx, Page*.tsx
├── server/              # per-domain: queries/, mutations/, *.functions.ts
└── styles/
    └── globals.css
```

Route params: Next.js `[id]` → Start `$id`; validate with Zod `params` schema on UI routes.

## Common migration mistakes

1. **Direct DB in loader/component** — works on SSR, breaks on client nav. Use `createServerFn`.
2. **Keeping `'use server'`** — invalid in Start; use `createServerFn`.
3. **`<Link to={\`/posts/${id}\`}>`** — use `to="/posts/$slug" params={{ slug: id }}`.
4. **`useLoaderData` for Query data** — use `useSuspenseQuery` with same `*QueryOptions`.
5. **Fat route files** — FMC: route exports config + one component import from `@/components/`.
6. **Vinxi / `@tanstack/start`** — deprecated; use Vite + `@tanstack/react-start`.
