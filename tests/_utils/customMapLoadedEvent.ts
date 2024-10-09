// Docs:
// It looks like we need some glue to get Playwright to properly wait for the map to be loaded,
// … in order to click inside the map canvas.
// We do this by sending this custom event `playwrightMapLoaded` with <Map onLoad>
// And then listen to this event in our test.

import { Page } from "@playwright/test"

export const playwrightSendMapLoadedEvent = () => {
  const event = new CustomEvent("playwrightMapLoaded")
  window.dispatchEvent(event)
}

export const playwrightWaitForMapLoadedEvent = async (page: Page) => {
  console.time("Waiting for custom Event `playwrightMapLoaded`")
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      window.addEventListener("playwrightMapLoaded", () => resolve(), { once: true })
    })
  })
  console.timeEnd("Waiting for custom Event `playwrightMapLoaded`")
}
