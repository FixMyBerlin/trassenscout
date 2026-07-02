import { createFileRoute } from "@tanstack/react-router"
import { PageAbschnitteSubsubsection } from "@/src/components/pages/abschnitte/PageAbschnitteSubsubsection"
import { privateTitleHead } from "@/src/routeHead"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard/",
)({
  head: () => privateTitleHead("Maßnahme "),
  ssr: "data-only",
  component: PageAbschnitteSubsubsection,
})
