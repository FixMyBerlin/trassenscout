# TILDA Playwright patterns (reference)

Canonical repo: **tilda-geo** `app/`. Trassenscout will align with these patterns when migrated to TanStack Start.

## Environment

| File              | Purpose                                                           |
| ----------------- | ----------------------------------------------------------------- |
| Repo `.env`       | `VITE_PLAYWRIGHT_ENABLED=true`, DB, app config                    |
| `app/.env.test`   | `TEST_OSM_USERNAME`, `TEST_OSM_PASSWORD` (OAuth setup only)       |
| `RUN_OAUTH_E2E=1` | Gate real OSM login in `auth-setup.spec.ts` and `regions.spec.ts` |

Vitest uses repo `.env`; `app/.env.test` is Playwright-only.

## Stubbed session flow

1. `createStubbedAdminSession` or `createStubbedUserSession(page, baseURL, { identityKey })` — Prisma user + signed Better Auth cookies.
2. `collectConsoleErrors` / `collectServerErrors` before `goto`.
3. Assert `main` visible and no blocking errors.
4. `cleanupStubbedSessionData('ADMIN' | 'USER', identityKey)` in route-scoped `afterEach`.

Serial mode / nested describes: see SKILL.md (Auth, parallel safety).

## Map

1. App hooks: see SKILL.md (App hooks).
2. Test: `waitForMapLoad(page)` listens for `mapLoaded` or falls back to `.maplibregl-canvas`.
3. Optional: `getMapLayerIds(page)` reads `window.__mainMap.getStyle().layers` for layer-order assertions.
4. Optional: `verifyMapRendered(page)`, then `verifyMapNetworkRequests(page)` for tile/API coverage (`regions.spec.ts`).

## Route fixtures

`tests/fixtures/routes.ts` exports:

- `PUBLIC_SMOKE_ROUTES` — unauthenticated smoke list (includes docs topic with `?r=`, OAuth error page, preview routes)
- `ADMIN_ROUTES`, `ADMIN_REDIRECT_SMOKE_ROUTE`
- `TEST_REGION_URL`, `TEST_REGION_URL_WITH_CONFIG` — map-heavy region URLs
