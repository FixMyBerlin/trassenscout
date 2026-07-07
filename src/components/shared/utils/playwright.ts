import { createIsomorphicFn } from "@tanstack/react-start"
import type { Map as MaplibreMap } from "maplibre-gl"
import { isPlaywright } from "@/src/components/core/utils/isEnv"

/** Legacy survey maps listen for this event name in E2E. */
const PLAYWRIGHT_MAP_LOADED_EVENT = "playwrightMapLoaded"

const MAP_LOADED_EVENT = "mapLoaded"

const isPlaywrightClientMode = () => isPlaywright || window.__PLAYWRIGHT_ENABLED === true

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
