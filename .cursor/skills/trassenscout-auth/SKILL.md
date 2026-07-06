---
name: trassenscout-auth
description: >-
  Trassenscout-specific Better Auth wiring: endpointAuth boundary API, route
  protection via auth.functions.ts, and oxlint enforcement. Pair with shared
  skill tanstack-start-auth for Better Auth library config.
disable-model-invocation: true
---

# Trassenscout auth (local)

Repo-specific auth patterns. Generic Better Auth config: skill **`tanstack-start-auth`**.

## When to apply

- `endpointAuth.*` in routes, API handlers, or `*.server.ts` exports
- `beforeLoad` gates via server functions in `auth.functions.ts`
- API key + session dual auth on automation endpoints

## References

| Topic | File |
| ----- | ---- |
| File layout, endpointAuth API, protection matrix | [references/auth.md](references/auth.md) |

## Related skills

- `tanstack-start-auth` — `betterAuth()` plugins, adapters, cookies (`tanstackStartCookies()`)
- `tanstack-start-conventions` — `.server.ts` / `.functions.ts`, SSR
- `playwright-skill` — E2E stubbed auth

## Non-negotiable rules

1. Session helpers always receive `headers: Headers` from the current request.
2. Route `beforeLoad` does not call DB/session directly — server functions + `getRequestHeaders()`.
3. Use official `tanstackStartCookies()` as the **last** plugin — see `auth.server.ts` and `tanstack-start-auth`.
4. `/api/auth/$` and handler-only API routes: `ssr: false`.
5. API routes: auth inside each handler via `endpointAuth.*` (no route-level `beforeLoad`).
6. Call sites import **only** `endpointAuth` from `endpointAuth.server.ts` — oxlint enforces.
7. Admin/role checks with cookie cache: `disableCookieCache: true`.
8. Compare API secrets with timing-safe equality.
