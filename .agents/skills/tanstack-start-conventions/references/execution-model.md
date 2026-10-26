# TanStack Start - Execution model

Start is isomorphic: loaders and components run on server and client. Official: [Execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model).

**Rule:** DB, filesystem, env secrets and server-only APIs live in a `createServerFn` (or `createServerOnlyFn` in `*.server.ts`) that the loader calls - never inline in a loader or component body (works on SSR, breaks on client navigation).

Route files and components import `*.functions.ts`, never `*.server.ts` ([client-server-boundaries.md](client-server-boundaries.md)).

## Common mistakes

1. **Direct DB/fs in loader or component** - wrap I/O in `createServerFn`.
2. **`useLoaderData` for Query-backed data** - use `useSuspenseQuery` with the same `*QueryOptions`; see `tanstack-router-conventions` -> `references/router-and-query.md`.
