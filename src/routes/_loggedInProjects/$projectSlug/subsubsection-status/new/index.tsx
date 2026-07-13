import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionStatusNew } from "@/src/components/pages/subsubsection-status/PageSubsubsectionStatusNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsubsection-status/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Phase")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageSubsubsectionStatusNew,
})
