import { createFileRoute } from "@tanstack/react-router"
import { PageKontakt } from "@/src/components/pages/content/PageKontakt"
import { publicPageHead } from "@/src/routeHead"

export const Route = createFileRoute("/_content/kontakt")({
  head: () => publicPageHead("Kontakt & Impressum"),
  ssr: true,
  component: PageKontakt,
})
