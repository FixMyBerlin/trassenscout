import { createFileRoute } from "@tanstack/react-router"
import { PageSubsubsectionSpecial } from "@/src/components/pages/subsubsection-special/PageSubsubsectionSpecial"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsubsection-special/")({
  head: () => privateTitleHead("Besonderheiten"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionSpecials",
      }),
    ),
  component: PageSubsubsectionSpecial,
})
