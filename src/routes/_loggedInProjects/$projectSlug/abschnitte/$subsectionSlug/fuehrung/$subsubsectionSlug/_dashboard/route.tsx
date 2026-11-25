import { createFileRoute } from "@tanstack/react-router"
import { LayoutSubsubsection } from "@/src/components/pages/abschnitte/LayoutSubsubsection"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard",
)({
  ssr: "data-only",
  pendingComponent: RouteMapShellPending,
  loader: async ({ context, params }) => {
    const subsection = await context.queryClient.ensureQueryData(
      subsectionBySlugQueryOptions({
        projectSlug: params.projectSlug,
        subsectionSlug: params.subsectionSlug,
      }),
    )
    await Promise.all([
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
          subsectionId: subsection.id,
        }),
      ),
    ])
  },
  component: LayoutSubsubsection,
})
