import { createFileRoute } from "@tanstack/react-router"
import { PageBrowserVersion } from "@/src/components/pages/content/PageBrowserVersion"
import { publicPageHead } from "@/src/routeHead"

export const Route = createFileRoute("/_content/browser-version")({
  head: () => publicPageHead("Browser Version übermitteln"),
  ssr: "data-only",
  component: PageBrowserVersion,
})
