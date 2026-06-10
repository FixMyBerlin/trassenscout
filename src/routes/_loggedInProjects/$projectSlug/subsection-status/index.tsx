import { createFileRoute } from "@tanstack/react-router"
import { PageSubsectionStatus } from "@/src/components/pages/subsection-status/PageSubsectionStatus"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsection-status/")({
  head: () => privateTitleHead("Status"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsectionStatuses",
      }),
    ),
  component: PageSubsectionStatus,
})
