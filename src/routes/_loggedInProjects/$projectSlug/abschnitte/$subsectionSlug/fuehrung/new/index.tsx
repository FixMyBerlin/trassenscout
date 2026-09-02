import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageAbschnitteFuehrungNew } from "@/src/components/pages/abschnitte/PageAbschnitteFuehrungNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"

const subsubsectionFormLookupTables = [
  "qualityLevels",
  "subsubsectionStatuses",
  "subsubsectionTasks",
  "subsubsectionInfras",
  "subsubsectionInfrastructureTypes",
] as const

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/new/",
)({
  head: () => absoluteTitleHead(seoNewTitle("Maßnahme ")),
  ssr: true,
  loader: async ({ context, params }) => {
    const subsection = await context.queryClient.ensureQueryData(
      subsectionBySlugQueryOptions({
        projectSlug: params.projectSlug,
        subsectionSlug: params.subsectionSlug,
      }),
    )
    await Promise.all(
      subsubsectionFormLookupTables.map((table) =>
        context.queryClient.ensureQueryData(
          adminLookupRowsWithCountQueryOptions({
            projectSlug: params.projectSlug,
            table,
          }),
        ),
      ),
    )
    return { subsection }
  },
  component: PageAbschnitteFuehrungNew,
})
