import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageAcquisitionAreaStatusNew } from "@/src/components/pages/acquisition-area-status/PageAcquisitionAreaStatusNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/acquisition-area-status/new/",
)({
  head: () => absoluteTitleHead(seoNewTitle("Status")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageAcquisitionAreaStatusNew,
})
