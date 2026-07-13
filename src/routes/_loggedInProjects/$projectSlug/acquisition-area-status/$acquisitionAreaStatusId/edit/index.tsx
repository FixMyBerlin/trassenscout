import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageAcquisitionAreaStatusEdit } from "@/src/components/pages/acquisition-area-status/PageAcquisitionAreaStatusEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/acquisition-area-status/$acquisitionAreaStatusId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Status")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "acquisitionAreaStatuses",
        id: Number(params.acquisitionAreaStatusId),
      }),
    ),
  component: PageAcquisitionAreaStatusEdit,
})
