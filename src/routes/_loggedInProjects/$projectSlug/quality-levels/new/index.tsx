import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageQualityLevelsNew } from "@/src/components/pages/quality-levels/PageQualityLevelsNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/quality-levels/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Ausbaustandard")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageQualityLevelsNew,
})
