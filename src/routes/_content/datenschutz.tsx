import { createFileRoute } from "@tanstack/react-router"
import { PageDatenschutz } from "@/src/components/pages/content/PageDatenschutz"
import { publicPageHead } from "@/src/routeHead"

export const Route = createFileRoute("/_content/datenschutz")({
  head: () => publicPageHead("Datenschutzerklärung"),
  ssr: true,
  component: PageDatenschutz,
})
