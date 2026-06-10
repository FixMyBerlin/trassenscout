import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageSubsectionStatusNew } from "@/src/components/pages/subsection-status/PageSubsectionStatusNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsection-status/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Status")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageSubsectionStatusNew,
})
