export const PLAYWRIGHT_MAP_LOADED_EVENT = "playwrightMapLoaded"

export const sendPlaywrightMapLoadedEvent = () => {
  const event = new CustomEvent(PLAYWRIGHT_MAP_LOADED_EVENT)
  window.dispatchEvent(event)
}
