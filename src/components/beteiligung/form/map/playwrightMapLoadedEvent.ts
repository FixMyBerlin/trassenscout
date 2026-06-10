import { createIsomorphicFn } from "@tanstack/react-start"

const PLAYWRIGHT_MAP_LOADED_EVENT = "playwrightMapLoaded"

export const sendPlaywrightMapLoadedEvent = createIsomorphicFn()
  .server(() => {})
  .client(() => {
    window.dispatchEvent(new CustomEvent(PLAYWRIGHT_MAP_LOADED_EVENT))
  })
