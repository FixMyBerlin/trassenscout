import { expect, type Page } from "@playwright/test"

const MAP_LOADED_EVENT = "mapLoaded"
const PLAYWRIGHT_MAP_LOADED_EVENT = "playwrightMapLoaded"

export const waitForMapLoad = async (page: Page) => {
  await expect(page.getByLabel("Map")).toBeVisible({ timeout: 60_000 })

  await Promise.race([
    page.evaluate(
      (eventNames) => {
        return new Promise<void>((resolve) => {
          const onLoaded = () => resolve()
          for (const eventName of eventNames) {
            window.addEventListener(eventName, onLoaded, { once: true })
          }
        })
      },
      [MAP_LOADED_EVENT, PLAYWRIGHT_MAP_LOADED_EVENT],
    ),
    page.locator(".maplibregl-canvas").waitFor({ state: "visible", timeout: 60_000 }),
  ])
}

export const verifyMapRendered = async (page: Page) => {
  await expect(page.locator(".maplibregl-canvas")).toBeVisible()
}

export const getMapLayerIds = async (page: Page) => {
  return page.evaluate(() => window.__mainMap?.getStyle().layers.map((layer) => layer.id) ?? [])
}
