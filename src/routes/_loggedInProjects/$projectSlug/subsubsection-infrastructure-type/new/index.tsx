import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionInfrastructureTypeNew } from "@/src/components/pages/subsubsection-infrastructure-type/PageSubsubsectionInfrastructureTypeNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/new/",
)({
  head: () => absoluteTitleHead(seoNewTitle("Gegenstand der Förderung")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageSubsubsectionInfrastructureTypeNew,
})
