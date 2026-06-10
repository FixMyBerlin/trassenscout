import type { RegisteredRouter } from "@tanstack/react-router"

declare global {
  interface Window {
    _paq?: Array<Array<string | number | boolean>>
  }
}

export function setupMatomoRouterTracking(router: RegisteredRouter) {
  // Client-only: TanStack emits onRendered after route content is in the DOM (not during SSR).
  router.subscribe("onRendered", (event) => {
    const origin = router.origin
    if (!origin) return

    window._paq = window._paq ?? []
    window._paq.push(["setCustomUrl", `${origin}${event.toLocation.href}`])
    window._paq.push(["setDocumentTitle", document.title])
    window._paq.push(["trackPageView"])
    window._paq.push(["enableLinkTracking"])
  })
}
