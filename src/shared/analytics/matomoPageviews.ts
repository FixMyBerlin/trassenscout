import type { RegisteredRouter } from "@tanstack/react-router"

declare global {
  interface Window {
    _paq?: Array<Array<string | number | boolean>>
  }
}

export function setupMatomoRouterTracking(router: RegisteredRouter) {
  // Client-only: TanStack emits onRendered after route content is in the DOM (not during SSR).
  router.subscribe("onRendered", (event) => {
    const origin = import.meta.env.VITE_APP_ORIGIN
    if (!origin) return

    const url = `${origin}${event.toLocation.href}`
    const title = document.title

    window._paq = window._paq ?? []
    window._paq.push(["setCustomUrl", url])
    window._paq.push(["setDocumentTitle", title])
    window._paq.push(["trackPageView"])
    window._paq.push(["enableLinkTracking"])

    // Dev/staging load no matomo.js, so mirror each pageview to the console (#3064).
    if (import.meta.env.VITE_APP_ENV !== "production") {
      console.log(`[Matomo] pageview: ${url} (${title})`)
    }
  })
}
