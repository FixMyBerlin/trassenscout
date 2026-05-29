# Playwright E2E in Trassenscout

## Runtime model

- E2E runs against the dev server (`npm run dev:e2e`) on `127.0.0.1:6174`.
- Test DB lifecycle is handled by Playwright global hooks:
  - setup: start `ts-test-db`, run migrations, run seed
  - teardown: stop/remove `ts-test-db` (unless `E2E_KEEP_DB=1`)
- Auth uses Playwright project dependencies:
  - `setup` project logs in real users and writes `tests/.auth/*.json`
  - browser projects depend on `setup` and reuse `storageState`

## Default execution

- Chromium is default.
- Firefox/WebKit run only with `E2E_ALL_BROWSERS=1`.
- Stability defaults:
  - `fullyParallel: false`
  - local workers default to `3` (override with `E2E_WORKERS`)

## Commands

- `npm run e2e` — full configured suite
- `npm run e2e:chromium` — Chromium project only
- `npm run e2e:ui` — Playwright UI mode
- `npx playwright test tests/project/surveys.permissions.spec.ts --project=chromium` — run a single spec

## Useful env switches

- `E2E_ALL_BROWSERS=1` — enable Firefox + WebKit projects
- `E2E_WORKERS=2` — override local worker count
- `E2E_KEEP_DB=1` — keep `ts-test-db` running after suite
- `E2E_BASE_URL=http://127.0.0.1:6174` — connect to an externally managed server (disables Playwright `webServer`)

## Debug checklist

1. Auth setup failures:
   - run `npx playwright test tests/auth.setup.ts --project=setup`
   - verify login labels still match UI (`E-Mail-Adresse`, `Passwort`, `Anmelden`)
2. DB startup failures:
   - check `docker ps` for `ts-test-db`
   - rerun with clean DB: `npm run posttest && npm run e2e:chromium`
3. Route guard flakiness:
   - avoid overlapping local E2E runs against the same `ts-test-db`
   - keep per-spec `allowedConsoleErrors` scoped and minimal

## Notes for map tests

- Map readiness currently relies on [customMapLoadedEvent.ts](./_utils/customMapLoadedEvent.ts).
- Drag-pin helpers live in [mapDragPin.ts](./_utils/mapDragPin.ts).

## References

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Next.js Playwright Guide](https://nextjs.org/docs/app/building-your-application/testing/playwright#running-your-playwright-tests)
- [MapGrab + Playwright](https://mapgrab.github.io/docs/getting-started/stage-two/playwright)
