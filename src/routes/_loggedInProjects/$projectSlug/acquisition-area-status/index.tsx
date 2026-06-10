import { createFileRoute } from "@tanstack/react-router"
import { PageAcquisitionAreaStatus } from "@/src/components/pages/acquisition-area-status/PageAcquisitionAreaStatus"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/acquisition-area-status/")({
  head: () => privateTitleHead("Status"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "acquisitionAreaStatuses",
      }),
    ),
  component: PageAcquisitionAreaStatus,
})
