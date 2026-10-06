import { createFileRoute } from "@tanstack/react-router"
import { RouteScopedNotFoundPage } from "@/src/components/shared/errors/RouteNotFoundPage"
import { LayoutExternalShare } from "@/src/components/shared/layouts/LayoutExternalShare"
import { publicPageHead } from "@/src/routeHead"

export const Route = createFileRoute("/share")({
  ssr: true,
  head: () => publicPageHead("Freigegebene Projektunterlagen"),
  // The token in the URL is the credential: no caching, no referrer, no indexing.
  headers: () => ({
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex",
  }),
  notFoundComponent: RouteScopedNotFoundPage,
  component: LayoutExternalShare,
})
