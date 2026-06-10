import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionInfraNew } from "@/src/components/pages/subsubsection-infra/PageSubsubsectionInfraNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsubsection-infra/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Führungsform")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageSubsubsectionInfraNew,
})
