---
name: playwright-skill
description: E2E testing and browser automation for TanStack Start apps (FMC/TILDA). Use @playwright/test for committed suites/CI; agent-browser MCP (skill tech-stack) for agent exploration; this skill for smoke tests, stubbed auth, map hooks, and quick ad-hoc scripts.
---

**Read the project’s `tests/README.md` first** — env vars, Docker, and scripts live there.

**Related FMC skills:** `tanstack-router-conventions` (routes/search), `tanstack-start-auth` (sessions), `tanstack-start-conventions`.

---

## Official docs (fetch; do not duplicate)

Playwright has **no** official `llms.txt` ([request closed](https://github.com/microsoft/playwright/issues/39895)).

| Topic                        | URL                                                                 |
| ---------------------------- | ------------------------------------------------------------------- |
| Intro & writing tests        | https://playwright.dev/docs/intro                                   |
| Locators (`getByRole`, etc.) | https://playwright.dev/docs/locators                                |
| Test configuration           | https://playwright.dev/docs/test-configuration                      |
| Best practices               | https://playwright.dev/docs/best-practices                          |
| CI                           | https://playwright.dev/docs/ci                                      |
| Agents (CLI)                 | https://playwright.dev/docs/getting-started-cli                     |
| TanStack doc index           | https://tanstack.com/llms.txt                                       |
| TanStack Start e2e examples  | https://github.com/TanStack/router/tree/main/e2e/react-start        |
| Map interactions (optional)  | https://mapgrab.github.io/docs/getting-started/stage-two/playwright |

---

## Three layers (pick the right tool)

| Layer                   | When                                                          | Where                                                                                              |
| ----------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Project E2E**         | Suites, CI, regression                                        | `@playwright/test` in `tests/*.spec.ts`, repo `playwright.config.ts`                               |
| **Agent exploration**   | Interactive debugging, hydration, React tree, quick UI checks | **agent-browser MCP** — skill `tech-stack`, skill `tech-stack` → `references/agent-browser-mcp.md` |
| **Ad-hoc** (this skill) | One-off scripts, external sites, no MCP                       | `/tmp/playwright-test-*.js` via `run.js`                                                           |
| **DB schema / queries** | Inspecting tables                                             | Postgres MCP — skill `tech-stack` → `references/postgres-mcp.md`                                   |

For in-repo work, **prefer project E2E** for anything that should regress.

### Boundaries (Playwright vs agent-browser)

| Concern                                      | `@playwright/test` (this skill)                 | agent-browser (tech-stack)    |
| -------------------------------------------- | ----------------------------------------------- | ----------------------------- |
| Regression, CI, stubbed auth, map test hooks | ✓                                               | —                             |
| Hydration, React tree, quick UI debugging    | —                                               | ✓                             |
| Maps (WebGL)                                 | `waitForMapLoad`, tile/network helpers, MapGrab | Annotated screenshots, `eval` |

**tilda-geo smoke / stubbed-auth / map specs:** read [references/tilda-patterns.md](references/tilda-patterns.md) when writing them (env gating, smoke suite, stubbed-session flow, map steps, route fixtures).

Exploration findings that should stick → add `tests/*.spec.ts` and run `bun run e2e`.

---

## TanStack Start — `playwright.config.ts`

Reference implementation: **tilda-geo** `app/playwright.config.ts`.

### Environment loading

Load env **before** `defineConfig` so `webServer` gets `DATABASE_*` etc., layered: repo `.env`, app `.env` (optional), `.env.test` (test-only).

### Server tiers

| Tier              | Use                           | `webServer.command`                         | Notes                                                                                                             |
| ----------------- | ----------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Local / smoke** | Fast feedback (TILDA default) | `bun run dev`                               | Vite dev, e.g. `http://127.0.0.1:5173`                                                                            |
| **CI / release**  | Production-like               | `bun run build && bun run start`            | Set `PORT` / `VITE_SERVER_PORT` like [TanStack e2e](https://github.com/TanStack/router/tree/main/e2e/react-start) |
| **Preview**       | Built assets + SSR preview    | `bun run build && bun run preview --port …` | TanStack `vite preview` mode                                                                                      |

**Docker / DB:** If the app needs Postgres or tiles, start compose **outside** Playwright (`docker compose up db tiles -d`). Do not cram compose into `webServer.command` unless CI already proves it works.

### Config template

Copy `playwright.config.ts.template` from this skill directory (baseURL `http://127.0.0.1:5173`, `webServer: bun run dev`, chromium project).

---

## FMC / TILDA patterns

Canonical paths in **tilda-geo** (`app/`):

| Concern                     | Location                                          |
| --------------------------- | ------------------------------------------------- |
| Config                      | `playwright.config.ts`                            |
| Setup docs                  | `tests/README.md`                                 |
| Smoke (public routes)       | `tests/smoke/public-routes.spec.ts`               |
| Smoke (trailing slash)      | `tests/smoke/trailing-slash-redirect.spec.ts`     |
| Smoke (region `beforeLoad`) | `tests/smoke/region-before-load.spec.ts`          |
| Stubbed admin / role auth   | `tests/pages/admin.stubbed-auth.spec.ts`          |
| Regions + map (real OAuth)  | `tests/pages/regions.spec.ts` (`RUN_OAUTH_E2E=1`) |
| Docs region downloads       | `tests/pages/docs-region-downloads.spec.ts`       |
| Contact profile modal       | `tests/pages/contact-profile-modal.spec.ts`       |
| Auth fixtures               | `tests/fixtures/auth.ts`                          |
| Route lists                 | `tests/fixtures/routes.ts`                        |
| Console / server errors     | `tests/utils/console.ts`, `tests/utils/server.ts` |
| Map wait / render helpers   | `tests/utils/maps.ts`                             |
| Map network verification    | `tests/utils/network.ts`                          |
| Dynamic URL regex escape    | `tests/utils/regex.ts`                            |
| App test hooks              | `src/components/shared/utils/playwright.ts`       |

### `VITE_PLAYWRIGHT_ENABLED`

In repo `.env` (see `.env.example`):

```bash
VITE_PLAYWRIGHT_ENABLED=true
```

Enables test IDs and map signals **only** in E2E — not in production HTML.

### App hooks (`playwright.ts`)

```typescript
import { createIsomorphicFn } from "@tanstack/react-start"

export function playwrightTestId(testId: string) {
  return import.meta.env.VITE_PLAYWRIGHT_ENABLED === "true" ? testId : undefined
}

export const exposeMainMapForDebugging = createIsomorphicFn()
  .server((_map?: MaplibreMap) => {})
  .client((map?: MaplibreMap) => {
    const playwrightEnabled =
      import.meta.env.VITE_PLAYWRIGHT_ENABLED === "true" || window.__PLAYWRIGHT_ENABLED === "true"
    if (import.meta.env.DEV || playwrightEnabled) {
      window.__mainMap = map
    }
  })

export const firePlaywrightMapLoadedEvent = createIsomorphicFn()
  .server(() => {})
  .client(() => {
    const playwrightEnabled =
      import.meta.env.VITE_PLAYWRIGHT_ENABLED === "true" || window.__PLAYWRIGHT_ENABLED === "true"
    if (!playwrightEnabled) return
    window.dispatchEvent(new CustomEvent("mapLoaded"))
    window.__mapLoaded = true
  })
```

Call both helpers from the map `onLoad` handler: `exposeMainMapForDebugging(event.target)` and `firePlaywrightMapLoadedEvent()`. `window.__mainMap` is available in dev and Playwright mode; the `mapLoaded` event remains Playwright-gated. Why expose the map and `onLoad` wiring: skill `react-map-gl` → `references/map-debug-exposure.md`. Tests use `tests/utils/maps.ts` (`waitForMapLoad`, `verifyMapRendered`, `checkMapTilesLoaded`, `getMapLayerIds`). For tile/API coverage on region pages, use `verifyMapNetworkRequests` from `tests/utils/network.ts` (after `waitForMapLoad`).

For **click/drag on map canvas**, consider [MapGrab](https://mapgrab.github.io/docs/getting-started/stage-two/playwright) (used in legacy Trassenscout surveys; adopt when migrating those flows to Start).

### Smoke tests (post-migration)

After **Next → TanStack Start**, add or run smoke specs:

1. `page.goto(route)` with `baseURL`
2. Assert pathname unchanged (no crash redirect)
3. `expect(page.locator('main').first()).toBeVisible()`
4. `expectNoConsoleErrors(page)` (see utils)

Route lists live in `tests/fixtures/routes.ts` (`PUBLIC_SMOKE_ROUTES`, `ADMIN_ROUTES`, `ADMIN_REDIRECT_SMOKE_ROUTE`, etc.). Run: `bun run e2e -- tests/smoke`.

### Auth

| Strategy          | When                         | TILDA                                                                                           |
| ----------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| **Stubbed admin** | Admin pages, search-param UI | `createStubbedAdminSession(page, baseURL, { identityKey })` — Better Auth cookies + Prisma user |
| **Stubbed user**  | Non-admin / modal flows      | `createStubbedUserSession(page, baseURL, { identityKey })`                                      |
| **Real OAuth**    | Map + regions regression     | `auth-setup.spec.ts` + `regions.spec.ts` when `RUN_OAUTH_E2E=1` + `TEST_OSM_*` in `.env.test`   |

**Parallel safety:** Stubbed admin suites share DB rows, so use `mode: 'serial'` and **nested** `test.describe` per route so `afterEach` cleanup does not delete another worker’s session (`cleanupStubbedSessionData('ADMIN' | 'USER', identityKey)`).

**Dynamic URLs:** Use `escapeRegExp(route)` from `tests/utils/regex.ts` when building `toHaveURL(new RegExp(...))` from fixture paths that may contain `?` or special characters.

### Quality helpers

Before `goto`, attach collectors; after navigation, assert:

- **Console:** `collectConsoleErrors` → filter `KNOWN_ACCEPTABLE_ERRORS` → fail on `error`
- **Server:** `collectServerErrors(page, baseURL)` — same-origin 5xx and `requestfailed`

Extend allowlists in the util files when a known benign error appears.

### Locators

Use `playwrightTestId('…')` only when role/label/text locators are insufficient.

---

## Project E2E workflow

**`package.json` script** (TILDA convention):

```json
"e2e": "playwright test --project=chromium"
```

- `bun run e2e` → chromium project (default local/CI run)
- `bun run e2e -- --ui` / `bun run e2e -- --debug` → pass Playwright flags after `--`
- `bun run e2e -- tests/smoke` → subset of specs

```bash
bun add -d @playwright/test dotenv
bunx playwright install chromium
# Start DB/tiles if required (see tests/README.md)
```

---

## Ad-hoc automation (skill runner)

**Setup (once):**

```bash
cd ${CLAUDE_SKILL_DIR} && bun run setup
```

**Workflow:**

1. For localhost: detect dev servers first:

   ```bash
   bun -e "require('${CLAUDE_SKILL_DIR}/lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
   ```

2. Write script to `/tmp/playwright-test-*.js` (never commit ad-hoc scripts to the skill dir).
3. Parameterize `TARGET_URL` at the top.
4. Run from the project directory (not the skill folder): `bun ${CLAUDE_SKILL_DIR}/run.js /tmp/playwright-test-*.js`. `run.js` resolves relative script paths and `takeScreenshot` output against the directory you ran it from; for raw `page.screenshot({ path })` use an absolute path.

**Headers** (identify automated traffic):

```bash
PW_HEADER_NAME=X-Automated-By PW_HEADER_VALUE=playwright-skill \
  bun ${CLAUDE_SKILL_DIR}/run.js /tmp/my-script.js
```

Multiple headers: `PW_EXTRA_HEADERS='{"X-Automated-By":"playwright-skill"}'`.

**Defaults:** Run headless by default (agents cannot watch a window); use `headless: false` only when a human wants to watch.

**Helpers** (`lib/helpers.js`): `detectDevServers`, `createContext` / `getExtraHeadersFromEnv`, `takeScreenshot`.

---
