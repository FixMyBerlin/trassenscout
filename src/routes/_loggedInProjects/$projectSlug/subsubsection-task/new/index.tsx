import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionTaskNew } from "@/src/components/pages/subsubsection-task/PageSubsubsectionTaskNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsubsection-task/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Maßnahmentyp")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageSubsubsectionTaskNew,
})
