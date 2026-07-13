import { createFileRoute, redirect } from "@tanstack/react-router"
import { PageEvaluations } from "@/src/components/pages/evaluations/PageEvaluations"
import { privateTitleHead } from "@/src/routeHead"
import { evaluationsPageQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/evaluations/")({
  head: () => privateTitleHead("Auswertungen"),
  ssr: true,
  loader: async ({ context, params }) => {
    const project = await context.queryClient.ensureQueryData(
      projectBySlugQueryOptions(params.projectSlug),
    )

    if (!project.evaluationsEnabled) {
      throw redirect({
        to: "/$projectSlug",
        params: { projectSlug: params.projectSlug },
      })
    }

    await context.queryClient.ensureQueryData(
      evaluationsPageQueryOptions({ projectSlug: params.projectSlug }),
    )
  },
  component: PageEvaluations,
})
