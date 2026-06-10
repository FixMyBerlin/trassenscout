import { createFileRoute } from "@tanstack/react-router"
import { PageSubsubsectionStatus } from "@/src/components/pages/subsubsection-status/PageSubsubsectionStatus"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsubsection-status/")({
  head: () => privateTitleHead("Phase"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionStatuses",
      }),
    ),
  component: PageSubsubsectionStatus,
})
