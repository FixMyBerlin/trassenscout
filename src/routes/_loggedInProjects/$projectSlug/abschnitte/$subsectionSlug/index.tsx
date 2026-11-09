import { createFileRoute } from "@tanstack/react-router"
import { PageAbschnitteSubsection } from "@/src/components/pages/abschnitte/PageAbschnitteSubsection"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { privateTitleHead } from "@/src/routeHead"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { subsectionDashboardSearchSchema } from "@/src/shared/subsubsections/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/")(
  {
    head: () => privateTitleHead("Planungsabschnitt"),
    ssr: "data-only",
    pendingComponent: RouteMapShellPending,
    validateSearch: subsectionDashboardSearchSchema,
    loader: async ({ context, params }) => {
      const subsections = await context.queryClient.ensureQueryData(
        subsectionsQueryOptions({ projectSlug: params.projectSlug }),
      )
      const subsection = subsections.find((ss) => ss.slug === params.subsectionSlug)
      if (subsection) {
        await context.queryClient.ensureQueryData(
          subsubsectionsQueryOptions({
            projectSlug: params.projectSlug,
            subsectionId: subsection.id,
          }),
        )
      }
    },
    component: PageAbschnitteSubsection,
  },
)
