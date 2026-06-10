import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageNetworkHierarchyEdit } from "@/src/components/pages/network-hierarchy/PageNetworkHierarchyEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/network-hierarchy/$networkHierarchyId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Netzhierarchie")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "networkHierarchies",
        id: Number(params.networkHierarchyId),
      }),
    ),
  component: PageNetworkHierarchyEdit,
})
