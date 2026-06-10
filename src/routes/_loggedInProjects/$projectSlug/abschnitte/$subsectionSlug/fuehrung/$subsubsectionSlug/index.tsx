import { createFileRoute } from "@tanstack/react-router"
import { PageAbschnitteSubsubsection } from "@/src/components/pages/abschnitte/PageAbschnitteSubsubsection"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { privateTitleHead } from "@/src/routeHead"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/",
)({
  head: () => privateTitleHead("Eintrag"),
  ssr: "data-only",
  pendingComponent: RouteMapShellPending,
  loader: async ({ context, params }) => {
    const [subsection, subsections, subsubsection] = await Promise.all([
      context.queryClient.ensureQueryData(
        subsectionBySlugQueryOptions({
          projectSlug: params.projectSlug,
          subsectionSlug: params.subsectionSlug,
        }),
      ),
      context.queryClient.ensureQueryData(
        subsectionsQueryOptions({ projectSlug: params.projectSlug }),
      ),
      context.queryClient.ensureQueryData(
        subsubsectionBySlugQueryOptions({
          projectSlug: params.projectSlug,
          subsectionSlug: params.subsectionSlug,
          subsubsectionSlug: params.subsubsectionSlug,
        }),
      ),
      context.queryClient.ensureQueryData(
        subsubsectionsQueryOptions({
          projectSlug: params.projectSlug,
          subsectionId: (
            await context.queryClient.ensureQueryData(
              subsectionBySlugQueryOptions({
                projectSlug: params.projectSlug,
                subsectionSlug: params.subsectionSlug,
              }),
            )
          ).id,
        }),
      ),
    ])
    return { subsection, subsections, subsubsection }
  },
  component: PageAbschnitteSubsubsection,
})
