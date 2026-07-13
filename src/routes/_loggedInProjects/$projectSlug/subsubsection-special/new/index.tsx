import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionSpecialNew } from "@/src/components/pages/subsubsection-special/PageSubsubsectionSpecialNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsubsection-special/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Besonderheit")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageSubsubsectionSpecialNew,
})
