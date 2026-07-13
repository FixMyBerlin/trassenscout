# Testing

## Unit tests (Vitest)

- Setup: [`setup.ts`](./setup.ts) (jest-dom + safe env defaults)
- Shared mocks: [`mocks/`](./mocks/)
- Run: `bun run test` (ensures Postgres via Docker, runs migrations, then Vitest)
- Watch: `bun run test-watch`

Integration tests use the same local Postgres container as dev (`scripts/test/docker.ts`). Pure unit tests should not require the database.

## E2E (Playwright)

- Run: `bun run e2e` (resets + seeds DB, starts dev server, runs auth setup, then chromium specs)
- Smoke only: `bun run e2e-smoke`
- Subsets while iterating:
  - `bun run e2e -- tests/project`
  - `bun run e2e -- tests/admin/smoke.spec.ts`
- Convenience scripts: `e2e-smoke`, `e2e-project`, `e2e-admin`

Parallel worker count is tuned in [`playwright.config.ts`](../playwright.config.ts) (`localWorkers` / `ciWorkers` constants — edit there if the dev server flakes under load).

Playwright’s `webServer` runs [`prepareAndStartDev.ts`](./prepareAndStartDev.ts) with [`.env.test`](../.env.test) (`VITE_PLAYWRIGHT_ENABLED=true`). Auth setup signs in via [`_utils/signInViaApi.ts`](./_utils/signInViaApi.ts). Config: [`playwright.config.ts`](../playwright.config.ts).

### Map testing

- Map helpers: [`utils/maps.ts`](./utils/maps.ts)
- MapGrab for layer clicks: [MapGrab Playwright docs](https://mapgrab.github.io/docs/getting-started/stage-two/playwright)
- Draggable pin example: [`survey/survey-frm7-neu.spec.ts`](./survey/survey-frm7-neu.spec.ts)

## Docs

- [Playwright](https://playwright.dev/docs/intro)
- [Vitest](https://vitest.dev/)
- [MapGrab + Playwright](https://mapgrab.github.io/docs/getting-started/stage-two/playwright)
