import { createFileRoute } from "@tanstack/react-router"
import { PageSubsubsectionInfra } from "@/src/components/pages/subsubsection-infra/PageSubsubsectionInfra"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsubsection-infra/")({
  head: () => privateTitleHead("Führungsformen"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionInfras",
      }),
    ),
  component: PageSubsubsectionInfra,
})
