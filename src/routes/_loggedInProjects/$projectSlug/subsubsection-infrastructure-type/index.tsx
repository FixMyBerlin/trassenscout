import { createFileRoute } from "@tanstack/react-router"
import { PageSubsubsectionInfrastructureType } from "@/src/components/pages/subsubsection-infrastructure-type/PageSubsubsectionInfrastructureType"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/",
)({
  head: () => privateTitleHead("Gegenstand der Förderung"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionInfrastructureTypes",
      }),
    ),
  component: PageSubsubsectionInfrastructureType,
})
