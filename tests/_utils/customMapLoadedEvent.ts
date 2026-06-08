// Docs:
// It looks like we need some glue to get Playwright to properly wait for the map to be loaded,
// … in order to click inside the map canvas.
// We do this by sending this custom event `playwrightMapLoaded` with <Map onLoad>
// And then listen to this event in our test.

import { PLAYWRIGHT_MAP_LOADED_EVENT } from "@/src/app/beteiligung/_components/form/map/playwrightMapLoadedEvent"
import { expect, Page } from "@playwright/test"

export const playwrightWaitForMapLoadedEvent = async (page: Page) => {
  await expect(page.getByLabel("Map")).toBeVisible({ timeout: 60_000 })

  // Pass the event name as a parameter — page.evaluate serialises the function
  // to a string and sends it to the browser, so closure variables from Node.js
  // imports are NOT available inside the callback.
  await Promise.race([
    page.evaluate((eventName) => {
      return new Promise<void>((resolve) => {
        window.addEventListener(eventName, () => resolve(), { once: true })
      })
    }, PLAYWRIGHT_MAP_LOADED_EVENT),
    page.locator(".maplibregl-canvas").waitFor({ state: "visible", timeout: 60_000 }),
  ])
}
