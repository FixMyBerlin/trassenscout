import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageQualityLevelsEdit } from "@/src/components/pages/quality-levels/PageQualityLevelsEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/quality-levels/$qualityLevelId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Ausbaustandard")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "qualityLevels",
        id: Number(params.qualityLevelId),
      }),
    ),
  component: PageQualityLevelsEdit,
})
