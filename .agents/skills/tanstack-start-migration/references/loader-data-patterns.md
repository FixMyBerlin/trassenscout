# Loader & Data Patterns (TanStack Start)

## Loader runs on server AND client

On **hard refresh / first visit**, the loader runs on the server (SSR). On **client-side navigation**, the same loader runs in the browser.

**Rule:** Anything that needs DB, filesystem, env secrets, or server-only APIs must be inside a `createServerFn` that the loader calls — not inline in the loader body.

```tsx
// WRONG — breaks on client nav
loader: async () => {
  const posts = await fs.readdir('content/posts')
  return { posts }
}

// CORRECT
loader: () => getAllPostsFn()
```

## Loader contract

- **Arguments:** `{ params, search?, context, deps? }` — typed from route path and `validateSearch`.
- **Return:** Serializable object (no functions, class instances). Passed via `Route.useLoaderData()` when not using Query.

## loaderDeps — when to re-run

```tsx
export const Route = createFileRoute('/products')({
  validateSearch: z.object({ q: z.string().optional(), page: z.number().default(1) }),
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page }),
  loader: async ({ deps }) => {
    return { list: await fetchProductsFn({ data: deps }) }
  },
  component: ProductsPage,
})
```

## beforeLoad — auth & redirects (FMC default)

Runs before loader. Use for redirects and light context — via server functions, not direct DB/session in route files:

```tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  loader: async ({ context }) => {
    return { projects: await getProjectsFn({ data: { userId: context.session.userId } }) }
  },
  component: Dashboard,
})
```

See `tanstack-start-auth` for session-via-Headers patterns.

## FMC: React Query integration (preferred)

For shared, invalidatable, or multi-route data:

1. Define `*QueryOptions` in `src/server/<domain>/`.
2. Loader: `context.queryClient.ensureQueryData(...)` (await if SSR/`head` needs resolved data).
3. Component: `useSuspenseQuery(sameOptions)` — **not** `useLoaderData` alone.

```tsx
export const postsQueryOptions = () =>
  queryOptions({ queryKey: ['posts'], queryFn: () => getAllPostsFn() });

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQueryOptions()),
  component: HomePage,
});

function HomePage() {
  const { data: posts } = useSuspenseQuery(postsQueryOptions());
  return <ul>{posts.map(...)}</ul>;
}
```

Query cache dehydrates from server to client automatically via `@tanstack/react-router-ssr-query`.

**One-off admin data:** Loader return + `useLoaderData()` is acceptable when Query invalidation is not needed.

## Errors

- Throw in loader → route `errorComponent` or root error boundary.
- Not found: `throw notFound()`.

## Pending & prefetch

- **pendingComponent:** Skeleton while loader in flight.
- **Link prefetch:** `<Link preload="intent" ... />` or `router.preloadRoute`.

## Gotchas

1. **Loader per route activation** — use `loaderDeps` for search/param-driven refetch.
2. **Serialization** — JSON-serializable returns only.
3. **Isomorphic loaders** — always route server I/O through `createServerFn`.
4. **Query vs loader data** — Query needs an observer (`useQuery` / `useSuspenseQuery`) for refetch and cache retention.
