import { createFileRoute } from "@tanstack/react-router"
import { PageQualityLevels } from "@/src/components/pages/quality-levels/PageQualityLevels"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/quality-levels/")({
  head: () => privateTitleHead("Ausbaustandards"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "qualityLevels",
      }),
    ),
  component: PageQualityLevels,
})
