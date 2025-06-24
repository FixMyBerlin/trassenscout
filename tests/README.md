# About Playwright in Trassenscout

- This is still WIP
- We can only run it in development
- It would be better, to run it againt a build version `npm run build && npm run start` but that does not work right await because our DB and docker needs to be running as well.
- We don't have a Github action, yet (see [\_todo](./_todo/)) and we don't have a concept of how to handle the database during CI runs
- Testing any map components: It was solved with a [CustomEvent](./_utils/customMapLoadedEvent.ts) for now. TODO: for the geo category map (SurveyMapLine) use [MapGrab](https://mapgrab.github.io/docs/getting-started/stage-two/playwright) - [install interface in map component](src/app/beteiligung/_components/form/map/installMapGrab.ts), test: get element by selector and click on layer.
- Testing map with draggable pin: (e.g. SimpleSurveyMap) MapGrab plus dragging the pin see [frm7](./survey-frm7.spec.ts) TODO: extract logic.

## Run tests

- `npx playwright test` – Runs the end-to-end tests for all browsers.

- `npx playwright test --ui` – Starts the interactive UI mode to run an debug one or all tests in specific browsers.

- [VS Code Plugin](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) to run specific tests right inside VS Code

- `npx playwright test --project=chromium` – Runs the tests only on Desktop Chrome.

- `npx playwright test example` – Runs the tests in a specific file.

## Create and update tests

Use the VS Code plugin to "Record New", "Record at Cursor" or "Pick Locator".

The YouTube Videos on the "Playwright" Channel provide a great intro.

## Docs

- https://playwright.dev/docs/intro
- https://nextjs.org/docs/app/building-your-application/testing/playwright#running-your-playwright-tests
- https://mapgrab.github.io/docs/getting-started/stage-two/playwright
