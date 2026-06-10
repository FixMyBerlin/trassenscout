import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageNetworkHierarchyNew } from "@/src/components/pages/network-hierarchy/PageNetworkHierarchyNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/network-hierarchy/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Ausbaustandard")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  component: PageNetworkHierarchyNew,
})
