# TanStack Router + Query

How we combine route loaders with React Query. Setup lives in `router.tsx` (`queryClient` in router context and pretty-JSON `parseSearch` / `stringifySearch`, see [router-search-serialization.md](router-search-serialization.md)).

**Further reading:** [TkDodo — TanStack Router and Query](https://tkdodo.eu/blog/tan-stack-router-and-query), [Router Query integration](https://tanstack.com/router/latest/docs/integrations/query).

## When to use what

| Need                                                                     | Pattern                                                                                   |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Shared or refetchable data (invalidation, window focus, multiple routes) | `*QueryOptions` once, loader primes cache, component uses `useQuery` / `useSuspenseQuery` |
| Data only for one route, no invalidation (most admin CRUD)               | Loader returns serializable data, read via `routeApi.useLoaderData()`                     |
| Redirects, auth, light context                                           | `beforeLoad`                                                                              |
| Join of several Query-backed sources                                     | Prefer a server/API join; else [Derived data](#derived--combined-query-data)              |
| Non-form action (delete, revoke, import, one-shot button)                | `useMutation` ([below](#client-mutations))                                                |
| Form submit                                                              | TanStack Form `onSubmit`, not wrapped in `useMutation`                                    |

Do **not** read Query-backed data only via `useLoaderData`: Query needs an observer (`useQuery` / `useSuspenseQuery`) for refetch, invalidation and cache retention. The loader is cache priming (`context.queryClient.ensureQueryData(...)` or `prefetchQuery`; await only if `head()` or first paint needs the data), not the component's data API. Use `useSuspenseQuery` for blocking UI (with `pendingComponent` / `errorComponent`), `useQuery` for optional or inline loading.

Loaders return JSON-serializable data. On a Vite SPA they run on the client.

Prefetch with `<Link preload="intent">` or `router.preloadRoute()`, paired with `defaultPreload: 'intent'`.

## Router defaults

- Same `queryClient` in router `context` and `QueryClientProvider` (root layout).
- `parseSearch` / `stringifySearch` pretty-JSON wrapper.
- `trailingSlash: 'never'` with a root `beforeLoad` trailing-slash redirect.
- `defaultPreloadStaleTime: 0` when using Query, so only one cache layer controls staleness.
- `defaultPreload: 'intent'`.

## Derived / combined Query data

If the client must compose several `*QueryOptions`:

- **Default for FMC:** combine in a wrapper hook (separate `useQuery` / `useQueries`, derive with `useMemo`). Export `*QueryOptions` per source. Use `select` only to shape one query's data, not for joins.
- Expensive final reduce that should skip rerenders when unchanged: one `useQueries({ queries, combine })`.
- Many consumers, nothing else needs the raw sources: one `queryOptions` whose `queryFn` does `Promise.all` (loses granular caches; one failure retries all).
- Many consumers, other screens still need the sources: derived `queryFn` calls `queryClient.fetchQuery` per `*QueryOptions`. The derived entry is a **snapshot**: invalidate it yourself when the sources change.

Do not invent a derived QueryCache key unless many consumers share the same expensive join. Prefer a small parent-owned composition over mounting the same derived hook in every list row. See [Combining TanStack Query data](https://www.nop33.com/blog/combining-tanstack-query-data/).

## Client mutations

- Delete, revoke, import, trigger hook, one-shot buttons -> `useMutation`.
- Form submit -> TanStack Form `onSubmit`; do **not** wrap in `useMutation` (`isSubmitting` already tracks pending).
- No `useTransition` for deletes or other non-form actions.

`mutationFn` calls the API (or `createServerFn` on Start) and **throws** on `{ success: false }`. `onSuccess`: invalidate Query (+ `router.invalidate()` when loaders need it) and toast. Pass `mutateAsync` into UI that takes a `Promise` (confirm/delete buttons). If the callback is typed `() => Promise<void>` and `mutateAsync` returns a record, wrap: `async () => { await x.mutateAsync(…) }`; do not widen the shared button type.

```tsx
const deleteItem = useMutation({
  mutationFn: async (id: string) => {
    const result = await deleteItemApi(id) // or deleteItemFn({ data: { id } })
    if (!result.success) throw new Error(result.message)
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: itemsQueryKey })
    await router.invalidate()
    toastSuccess('Deleted.')
  },
})

<ConfirmButton onConfirm={() => deleteItem.mutateAsync(id)} />
```

Start server-fn details and SSR dehydration: `tanstack-start-conventions` (`references/server-functions.md`).
