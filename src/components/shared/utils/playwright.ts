import { createIsomorphicFn } from "@tanstack/react-start"
import type { Map as MaplibreMap } from "maplibre-gl"

/** Legacy survey maps listen for this event name in E2E. */
const PLAYWRIGHT_MAP_LOADED_EVENT = "playwrightMapLoaded"

const MAP_LOADED_EVENT = "mapLoaded"

export const isPlaywrightEnabled = () =>
  import.meta.env.VITE_PLAYWRIGHT_ENABLED === "true" || window.__PLAYWRIGHT_ENABLED === true

const isPlaywrightClientMode = () => isPlaywrightEnabled()

export const exposeMainMapForDebugging = createIsomorphicFn()
  .server((_map?: MaplibreMap) => {})
  .client((map?: MaplibreMap) => {
    if (import.meta.env.DEV || isPlaywrightClientMode()) {
      window.__mainMap = map
    }
  })

export const firePlaywrightMapLoadedEvent = createIsomorphicFn()
  .server(() => {})
  .client(() => {
    if (!isPlaywrightClientMode()) return
    window.dispatchEvent(new CustomEvent(MAP_LOADED_EVENT))
    window.dispatchEvent(new CustomEvent(PLAYWRIGHT_MAP_LOADED_EVENT))
    window.__mapLoaded = true
  })
