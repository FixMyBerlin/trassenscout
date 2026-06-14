---
name: trassenscout-auth
description: >-
  Trassenscout-specific Better Auth on TanStack Start: manual cookie forwarding,
  endpointAuth boundary API, OSM OAuth sign-in, route protection, and API keys.
  Use for auth routes, session helpers, secured routes/APIs, and ESLint
  endpointAuth rules. Pair with portable skill tanstack-start-auth for library
  config (betterAuth plugins, adapters).
disable-model-invocation: true
---

# Trassenscout auth (local)

Project-specific auth wiring for this repo. The portable **`tanstack-start-auth`** skill may be replaced upstream — **this skill is the source of truth** for Trassenscout patterns.

## When to apply

- Mounting `/api/auth/*`, cookie forwarding, OAuth sign-in routes
- `endpointAuth.*` in routes, API handlers, or `*.server.ts` exports
- `beforeLoad` gates via server functions (`require*ForRoute`, `auth.functions.ts`)
- API key + session dual auth on automation endpoints

## References

| Topic                                                     | File                                     |
| --------------------------------------------------------- | ---------------------------------------- |
| Routes, cookies, session, endpointAuth, protection matrix | [references/auth.md](references/auth.md) |

**Portable Better Auth config** (plugins, adapters, env): skill `tanstack-start-auth` → `references/better-auth-config.md` (when present).

## Related skills

- `tanstack-start-conventions` — `.server.ts` / `.functions.ts`, boundaries, SSR
- `tanstack-start-app-structure` — `src/server/auth/` layout
- `playwright-skill` — E2E stubbed auth

## Non-negotiable rules

1. Session helpers always receive `headers: Headers` from the current request.
2. Route `beforeLoad` does not call DB/session directly — server functions + `getRequestHeaders()`.
3. **Do not** add `tanstackStartCookies()` — use `forwardAuthAndApplyCookies` ([auth.md](references/auth.md)).
4. `/api/auth/$` and handler-only API routes: `ssr: false`.
5. API routes: auth inside each handler via `endpointAuth.*` (no route-level `beforeLoad`).
6. Call sites import **only** `endpointAuth` from `endpointAuth.server.ts` — ESLint enforces.
7. Admin/role checks with cookie cache: `disableCookieCache: true`.
8. Compare API secrets with timing-safe equality.
