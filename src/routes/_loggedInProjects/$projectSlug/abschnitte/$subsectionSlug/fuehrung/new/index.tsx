import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageAbschnitteFuehrungNew } from "@/src/components/pages/abschnitte/PageAbschnitteFuehrungNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"

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
    return { subsection }
  },
  component: PageAbschnitteFuehrungNew,
})
