import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageSubsectionStatusEdit } from "@/src/components/pages/subsection-status/PageSubsectionStatusEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/subsection-status/$subsectionStatusId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Status")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsectionStatuses",
        id: Number(params.subsectionStatusId),
      }),
    ),
  component: PageSubsectionStatusEdit,
})
