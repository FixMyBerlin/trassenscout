import { createFileRoute } from "@tanstack/react-router"
import { PageNetworkHierarchy } from "@/src/components/pages/network-hierarchy/PageNetworkHierarchy"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/network-hierarchy/")({
  head: () => privateTitleHead("Netzstufen"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "networkHierarchies",
      }),
    ),
  component: PageNetworkHierarchy,
})
