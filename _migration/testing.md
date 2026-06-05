# Testing migration: Trassenscout → TanStack Start

Analysis date: 2026-06-05  
Reference: [`tilda-geo/app`](../../tilda-geo/app) (TanStack Start target)  
Current: Trassenscout (Blitz 2 / Next.js 14)

This document compares unit, component, and E2E testing between both repos and defines what to **adopt from TILDA**, what to **keep from Trassenscout**, and what to **rewrite** during the Next → TanStack Start migration.

Related docs: [`tech-stack-migration.md`](./tech-stack-migration.md), [`auth.md`](./auth.md), [`tooling.md`](./tooling.md), [`package-script-names.md`](./package-script-names.md)

---

## Executive summary

| Layer | Trassenscout today | TILDA (target pattern) | Migration stance |
| ----- | ------------------ | ---------------------- | ---------------- |
| **Unit (Vitest)** | 5 server mutation tests, Blitz `db.$reset()`, `@next/env` | 36 tests (server + pure logic + components), Vite `loadEnv`, no DB in CI | Adopt TILDA Vitest config; rewrite DB tests for Prisma 7 / Better Auth |
| **Component** | Blitz `render()` wrapper + `next-router-mock` | 3 `*.test.tsx` with `@tanstack/react-router` mocks + `jsdom` | Adopt TILDA pattern; drop Blitz test utils |
| **E2E (Playwright)** | 5 specs, no `webServer`, 3 browsers, MapGrab, survey flows | 9 specs, `webServer`, smoke suite, stubbed auth, console/server checks | Adopt TILDA infra; **keep** TS map/survey E2E assets |
| **CI** | Vitest in `check`; tests disabled in pre-push; no PR Playwright | Vitest in `ci.yml`; E2E local only | Adopt TILDA PR CI; add Playwright job later (see below) |

TILDA is the structural reference (Vitest config, scripts, Playwright layout, auth fixtures, smoke tests). Trassenscout has **domain-specific E2E value** (surveys, MapGrab, pin drag) that TILDA does not cover and should be preserved.

---

## Inventory

### Trassenscout

| Kind | Count | Location |
| ---- | ----- | -------- |
| Unit tests | 5 | `src/server/**/*.test.ts` |
| Playwright specs | 5 | `tests/**/*.spec.ts` |
| Blitz test utils | 1 | `tests/blitz/utils.tsx`, `tests/blitz/setup.ts` |
| E2E helpers | 6 | `tests/_utils/`, `tests/survey/` |
| Draft CI workflow | 1 | `tests/_todo/playwright.yml` (not active) |

### TILDA

| Kind | Count | Location |
| ---- | ----- | -------- |
| Unit tests | 33 `.test.ts` + 3 `.test.tsx` | Co-located under `src/`, `scripts/` |
| Playwright specs | 9 | `tests/**/*.spec.ts` |
| Fixtures & utils | 8 | `tests/fixtures/`, `tests/utils/` |
| Playwright app helpers | 1 | `src/components/shared/utils/playwright.ts` |

---

## Tooling comparison

### Package scripts

| Script | Trassenscout | TILDA (target) |
| ------ | ------------ | -------------- |
| Unit run | `test` → `vitest run --passWithNoTests \|\| :` | `test-run` → `vitest run --passWithNoTests` |
| Unit watch | `test:watch` (+ docker lifecycle) | `test` → `vitest watch` |
| Unit UI | `test:ui` | — |
| E2E | *(none — use `npx playwright test`)* | `test-e2e`, `test-e2e-ui`, `test-e2e-debug` |
| Quality gate | `check` includes `test` (sequential) | `check` runs `test-run` in parallel |

**Migrate to TILDA script names** (see [`package-script-names.md`](./package-script-names.md)):

```json
"test": "vitest watch",
"test-run": "vitest run --passWithNoTests",
"test-e2e": "playwright test",
"test-e2e-ui": "playwright test --ui",
"test-e2e-debug": "playwright test --debug"
```

**Fix:** drop `|| :` from the unit test script — it masks Vitest failures.

### Dependencies

| Package | Trassenscout | TILDA | Action |
| ------- | ------------ | ----- | ------ |
| `vitest` | 3.2.4 | 4.1.7 | Upgrade with migration |
| `@vitejs/plugin-react` | yes | yes | Keep |
| `@vitest/ui` | yes | no | Optional; keep if team uses it |
| `@playwright/test` | 1.58.2 | 1.60.0 | Align version |
| `@testing-library/react` | 16.3.2 | 16.3.2 | Keep |
| `@testing-library/jest-dom` | yes | yes | Keep |
| `@testing-library/dom` | yes | transitive | Drop explicit dep if unused |
| `@testing-library/react-hooks` | yes | — | **Remove** (deprecated) |
| `jsdom` | 26.x | 29.x | Upgrade |
| `@faker-js/faker` | yes | — | **Keep** (E2E data) |
| `@mapgrab/map-interface` | yes | — | **Keep** (map E2E) |
| `@mapgrab/playwright` | yes | — | **Keep** (map E2E) |
| `next-router-mock` | yes | — | **Remove** |
| `@next/env` (Vitest) | yes | — | **Remove** → Vite `loadEnv` |

---

## Unit tests (Vitest)

### Config

**Trassenscout** (`vitest.config.ts`):

- Uses `@next/env` `loadEnvConfig` — replace with Vite `loadEnv`.
- `setupFiles`: `tests/blitz/setup.ts` (only imports `@testing-library/jest-dom`).
- `include`: `**/*.test.ts` only (no `.tsx`).
- `alias`: `@/` → repo root (non-standard).
- `coverage` reporter configured.
- `minWorkers` / `maxWorkers`: 1.

**TILDA** (`vitest.config.ts`) — **adopt this shape**:

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const env = loadEnv('test', repoRoot, 'VITE_')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  test: {
    dir: './',
    env,
    globals: true,
    setupFiles: './test/setup.ts',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    maxWorkers: 1,
  },
})
```

**Target setup file** (`test/setup.ts`):

- `@testing-library/jest-dom`
- Safe default `DATABASE_*` placeholders (TILDA pattern) so imports that touch Prisma do not crash in pure-logic tests
- TS-specific: locale / Zod de-locale if needed (mirror TILDA `zodDeLocale`)

### Test placement & naming

| Convention | Trassenscout | TILDA (target) |
| ---------- | ------------ | -------------- |
| Unit file suffix | `*.test.ts` | `*.test.ts`, `*.test.tsx` |
| E2E file suffix | `*.spec.ts` | `*.spec.ts` |
| Co-location | Next to mutations | Next to source (`src/**`) |
| Vitest `include` | `*.test.ts` | `*.test.ts`, `*.test.tsx` |
| Vitest `exclude` | implicit (`.spec.ts` not matched) | same |

### Database-backed unit tests

Trassenscout runs **5 mutation tests** against a real Postgres via Docker:

```json
"pretest": "docker run … ts-test-db postgres:16-alpine",
"posttest": "docker rm ts-test-db -f"
```

Tests call `db.$reset()` — provided by Blitz `enhancePrisma`, **not** available after Blitz removal.

| Approach | When to use |
| -------- | ----------- |
| **Pure logic tests** (no DB) | Default — TILDA style; runs in CI without Docker |
| **Integration tests** (Prisma) | Local / optional CI job; use `docker compose` or testcontainers |
| **Mock Prisma** | Auth/email tests during Better Auth migration |

**Migration tasks for existing TS unit tests:**

1. `signup.test.ts`, `forgotPassword.test.ts`, `resetPassword.test.ts` — rewrite for Better Auth (see [`auth.md`](./auth.md)); mock email (`preview-email` → Brevo stub).
2. `createInvite.test.ts` — rewrite against new invite + auth model.
3. `createLogEntry.test.ts` — keep as integration test; replace `db.$reset()` with explicit `truncate` helper or per-test transactions.

**Keep** the docker `pretest`/`posttest` pattern for integration tests, but scope it to a dedicated script (e.g. `test-integration`) so `test-run` stays CI-fast like TILDA.

### Blitz test utilities — remove

`tests/blitz/utils.tsx` wraps RTL `render` / `renderHook` with:

- `BlitzProvider` + `@blitzjs/rpc` `QueryClient`
- `MemoryRouterProvider` (`next-router-mock`)
- `RouterContext` from `@blitzjs/next`

**Replace with TILDA component-test pattern** — mock `@tanstack/react-router`:

```ts
/** @vitest-environment jsdom */
vi.mock('@tanstack/react-router', () => ({
  getRouteApi: () => ({ useLoaderData: vi.fn() }),
}))
```

For hooks that need QueryClient, wrap with `@tanstack/react-query` `QueryClientProvider` only where needed — do not recreate a global Blitz wrapper.

---

## Component tests

TILDA has **3 component tests** using `/** @vitest-environment jsdom */` and heavy `vi.mock` of route loaders and child components. This is the target pattern for TS UI tests after migration.

Trassenscout has **no component unit tests** today; the Blitz `render()` helper was scaffolded but unused.

**Adopt:**

- Co-located `ComponentName.test.tsx` beside components
- Explicit `jsdom` pragma per file (Vitest default is `node`)
- Mock `getRouteApi` / `useLoaderData` instead of full router

**Do not port:** `next-router-mock`, `BlitzProvider`, `@testing-library/react-hooks`.

---

## E2E tests (Playwright)

### Config comparison

| Setting | Trassenscout | TILDA (target) | Recommendation |
| ------- | ------------ | -------------- | -------------- |
| `baseURL` | `http://127.0.0.1:6173` | `http://127.0.0.1:5173` | Use Vite dev port (`5173`) |
| `webServer` | commented out | `bun run dev` | **Adopt TILDA** |
| `projects` | chromium, firefox, webkit | chromium only | Start chromium-only in CI; keep multi-browser optional locally |
| `retries` | CI: 2 | CI: 2 | Same |
| `workers` | CI: 1 | CI: 1 | Same |
| Env loading | `.env.test` only | `../.env` → `.env` → `.env.test` | **Adopt TILDA** layered dotenv |

### Directory layout (target)

```
tests/
  README.md
  auth-setup.spec.ts          # real OAuth (optional, RUN_OAUTH_E2E=1)
  fixtures/
    auth.ts                   # stubbed + stored sessions
    routes.ts                 # PUBLIC_SMOKE_ROUTES, ADMIN_ROUTES, …
  pages/                      # feature specs
  smoke/                      # unauthenticated route smokes
  survey/                     # TS-specific — keep
  utils/
    console.ts
    server.ts
    maps.ts
    network.ts
    regex.ts
  _utils/                     # TS-specific — merge into utils/ over time
    faker.ts
    mapDragPin.ts
    support.ts                # MapGrab merge
```

### Smoke tests — adopt from TILDA

TILDA `tests/smoke/public-routes.spec.ts` iterates `PUBLIC_SMOKE_ROUTES` from `tests/fixtures/routes.ts`:

- Page loads, path unchanged, `main` visible, no console errors
- Admin redirect when unauthenticated

**Create TS equivalent** after route migration:

```ts
export const PUBLIC_SMOKE_ROUTES = [
  '/',
  '/kontakt',
  '/datenschutz',
  // … post-migration public routes
] as const
```

Use smoke tests as the **first E2E milestone** after TanStack Start scaffold (cheaper than full survey flows).

### Auth E2E — adopt from TILDA

| Mode | TILDA | Trassenscout | Target for TS |
| ---- | ----- | ------------ | ------------- |
| Real login | `auth-setup.spec.ts` + `RUN_OAUTH_E2E=1` + OSM creds | — | Email/password via Better Auth (no OSM at launch — see [`auth.md`](./auth.md)) |
| Stored session | `tests/.auth/session.json` | — | Adapt cookie names (`trassenscout.session_*`) |
| Stubbed login | `createStubbedAdminSession` / `createStubbedUserSession` | — | **Adopt** — HMAC-signed Better Auth cookies, DB upsert |
| Admin role switch | `switchUserToAdmin(userId)` | — | Adapt for TS roles |

Port `tests/fixtures/auth.ts` and `admin.stubbed-auth.spec.ts` almost verbatim; change cookie prefix and user model fields.

### Console & server error checks — adopt from TILDA

TILDA collects:

- `collectConsoleErrors` / `expectNoConsoleErrors` (`tests/utils/console.ts`)
- `collectServerErrors` / `expectNoServerErrors` (`tests/utils/server.ts`) — same-origin 5xx and failed requests

Trassenscout specs do not assert on console/server errors. **Add these helpers** to all new smoke and admin specs.

### Playwright test IDs — adopt from TILDA

TILDA `playwrightTestId()` in `src/components/shared/utils/playwright.ts`:

- Returns `data-testid` only when `VITE_PLAYWRIGHT_ENABLED=true`
- Avoids polluting production HTML
- `firePlaywrightMapLoadedEvent` via `createIsomorphicFn` (SSR-safe)

Trassenscout uses a raw `playwrightMapLoaded` custom event and dev-only MapGrab install. **Migrate to TILDA gating** (`VITE_PLAYWRIGHT_ENABLED`) and unify event name to `mapLoaded`.

### Map E2E — keep from Trassenscout

| Capability | Trassenscout | TILDA | Keep |
| ---------- | ------------ | ----- | ---- |
| Map load wait | `playwrightWaitForMapLoadedEvent` | `waitForMapLoad` + canvas fallback | Merge: TILDA wait + TS MapGrab |
| Layer interaction | `@mapgrab/playwright` merged test/expect | — | **Yes** |
| MapGrab install | `installMapGrabIfTest` (dev only, not gated) | — | Gate with `VITE_PLAYWRIGHT_ENABLED` |
| Pin drag | `mapDragPin.ts` | — | **Yes** |
| Network tile checks | — | `verifyMapNetworkRequests` | Adopt TILDA for region maps; add TS tile patterns for survey maps |

**Support merge** (keep TS pattern):

```ts
// tests/utils/support.ts
import { mergeExpects, mergeTests, expect as pwExpect, test as pwTest } from '@playwright/test'
import { expect as mapGrabExpect, test as mapGrabTest } from '@mapgrab/playwright'

export const test = mergeTests(pwTest, mapGrabTest)
export const expect = mergeExpects(pwExpect, mapGrabExpect)
```

### Survey E2E — keep & adapt

Trassenscout has **rich survey participation flows** TILDA does not need:

| Spec | Purpose |
| ---- | ------- |
| `survey-demos.spec.ts` | Parametrized demo surveys (`rstest-*`) |
| `survey-bb-part1.spec.ts`, `survey-bb-part1-2.spec.ts` | Brandenburg survey |
| `survey-frm7-neu.spec.ts` | Full flow + map pin drag |
| `filloutAndTestPartOne.ts` | Shared step helper |
| `tests/_utils/faker.ts` | German faker data |

**Keep** these specs and helpers; update URLs when `beteiligung` routes move to TanStack file routes. Extract shared survey steps into `tests/utils/survey.ts` over time.

### Static pages — merge

TS `tests/static-pages.spec.ts` checks title/h1/noindex — fold into `PUBLIC_SMOKE_ROUTES` smoke loop or keep as focused spec.

---

## Environment variables

| File | Trassenscout | TILDA | Target |
| ---- | ------------ | ----- | ------ |
| Repo `.env` | partial | `VITE_*`, `DATABASE_*`, `SESSION_SECRET_KEY` | Standard |
| `.env.test` | `DATABASE_URL`, `IS_TEST` | Playwright creds only | Split concerns like TILDA |
| Vitest | loads via `@next/env` | `loadEnv('test', repoRoot, 'VITE_')` | TILDA |
| Playwright | `.env.test` | layered: `../.env` → `.env` → `.env.test` | TILDA |

**Target `.env.test` (Playwright only):**

```bash
TEST_USER_EMAIL=…
TEST_USER_PASSWORD=…
# Real OAuth (if ever needed): RUN_OAUTH_E2E=1
```

**Repo `.env` / `.env.example`:**

```bash
VITE_PLAYWRIGHT_ENABLED=true   # local E2E only
```

Vitest must **not** depend on `.env.test` secrets (TILDA comment in `app/.env.test`).

---

## CI / quality gates

| Check | Trassenscout | TILDA | Target |
| ----- | ------------ | ----- | ------ |
| PR unit tests | via `check` (when run) | `ci.yml` → `bun run test-run` | **Adopt TILDA** |
| PR Playwright | draft `tests/_todo/playwright.yml` | not in CI | Phase 2: smoke + stubbed-auth only |
| Pre-push tests | disabled (no DB) | `bun run check` | Enable `test-run` (no DB needed) after unit tests are mostly pure |
| Vitest env in CI | `DATABASE_URL` from `.env.test` + docker | `VITE_APP_ENV`, `VITE_APP_ORIGIN` | TILDA pattern |

**Phase 1 CI** (match TILDA):

```yaml
- name: Run tests
  env:
    VITE_APP_ENV: development
    VITE_APP_ORIGIN: http://127.0.0.1:5173
  run: bun run test-run
```

**Phase 2 CI** (Playwright — stubbed auth, no real email/OAuth):

- `docker compose up db -d`
- `bun run build && bun run preview` or `webServer` in config
- `playwright test tests/smoke tests/pages/admin.stubbed-auth.spec.ts`
- Upload `playwright-report` artifact (see TS draft workflow)

---

## Migration phases

### Phase 0 — Vitest scaffold (no app rewrite)

- [ ] Replace `vitest.config.ts` with TILDA `loadEnv` pattern
- [ ] Move `tests/blitz/setup.ts` → `test/setup.ts`; delete Blitz utils
- [ ] Add `test-run`, `test-e2e*` scripts; fix `|| :` mask
- [ ] Add PR `ci.yml` job with `test-run`
- [ ] Remove `@next/env`, `next-router-mock`, `@testing-library/react-hooks` from devDeps

### Phase 1 — Unit test port

- [ ] Convert surviving server tests to pure mocks OR `test-integration` + docker
- [ ] Replace `db.$reset()` with truncate helper / transactions (Prisma 7)
- [ ] Rewrite auth mutation tests for Better Auth
- [ ] Add first component test using TILDA router-mock pattern

### Phase 2 — Playwright infra

- [ ] Port `playwright.config.ts` from TILDA (`webServer`, layered env)
- [ ] Add `src/lib/playwright.ts` (`playwrightTestId`, `firePlaywrightMapLoadedEvent`)
- [ ] Port `tests/fixtures/`, `tests/utils/console.ts`, `tests/utils/server.ts`
- [ ] Port stubbed auth; adapt cookie names for Better Auth
- [ ] Create `tests/fixtures/routes.ts` + `tests/smoke/public-routes.spec.ts`

### Phase 3 — Domain E2E

- [ ] Port `tests/utils/support.ts` (MapGrab merge)
- [ ] Gate `installMapGrabIfTest` with `VITE_PLAYWRIGHT_ENABLED`
- [ ] Rewrite survey spec URLs for TanStack routes
- [ ] Extract `mapDragPin`, `faker` into `tests/utils/`
- [ ] Decide: multi-browser local only vs chromium-only everywhere

### Phase 4 — CI hardening

- [ ] Playwright job (smoke + stubbed admin)
- [ ] Enable `test-run` in pre-push (no docker)
- [ ] Optional: `test-integration` nightly job with Postgres

---

## Decision log

| Topic | Decision | Rationale |
| ----- | -------- | --------- |
| Vitest env | TILDA `loadEnv` | No Next dependency; matches Vite app |
| E2E `webServer` | TILDA | TS manual dev server is friction; README says WIP |
| E2E browsers | Chromium in CI; 3 browsers optional local | TS runs all 3 — slow; TILDA pragmatic default |
| MapGrab | **Keep TS** | TILDA has no layer-click E2E; needed for survey maps |
| `playwrightTestId` | **Adopt TILDA** | Production-safe vs TS dev-only test hooks |
| `db.$reset()` | **Drop** | Blitz-specific; use truncate or mocks |
| Blitz `render()` | **Drop** | Use TILDA TanStack router mocks |
| Survey specs | **Keep** | Core TS product coverage |
| Smoke route list | **Adopt TILDA** | Best regression net for migration |
| Stubbed auth | **Adopt TILDA** | Enables admin E2E without email/OAuth |
| `test \|\| :` | **Remove** | Hides failures |

---

## File mapping (Trassenscout → target)

| Current | Target | Action |
| ------- | ------ | ------ |
| `vitest.config.ts` | `vitest.config.ts` | Rewrite (TILDA template) |
| `tests/blitz/setup.ts` | `test/setup.ts` | Move + extend |
| `tests/blitz/utils.tsx` | — | Delete |
| `tests/blitz/mocks/*` | `test/mocks/*` or inline | Keep mocks if still used |
| `playwright.config.ts` | `playwright.config.ts` | Rewrite (TILDA + MapGrab comment) |
| `tests/_utils/support.ts` | `tests/utils/support.ts` | Keep |
| `tests/_utils/customMapLoadedEvent.ts` | `src/lib/playwright.ts` | Replace with TILDA isomorphic helper |
| `tests/_utils/faker.ts` | `tests/utils/faker.ts` | Keep |
| `tests/_utils/mapDragPin.ts` | `tests/utils/mapDragPin.ts` | Keep |
| `tests/README.md` | `tests/README.md` | Merge TILDA + TS map docs |
| `tests/_todo/playwright.yml` | `.github/workflows/e2e.yml` | Activate when DB story is clear |
| `.env.test` | `.env.test` | Playwright-only secrets |

---

## References

- TILDA: [`tilda-geo/app/tests/README.md`](../../tilda-geo/app/tests/README.md)
- TILDA: [`vitest.config.ts`](../../tilda-geo/app/vitest.config.ts), [`playwright.config.ts`](../../tilda-geo/app/playwright.config.ts)
- TILDA: [`tests/fixtures/auth.ts`](../../tilda-geo/app/tests/fixtures/auth.ts)
- TS: [`tests/README.md`](../tests/README.md)
- MapGrab: https://mapgrab.github.io/docs/getting-started/stage-two/playwright
- Improvement ideas for TILDA (from TS): [`tilda-geo/app/test-setup-improvement-leads-from-ts.md`](../../tilda-geo/app/test-setup-improvement-leads-from-ts.md)
