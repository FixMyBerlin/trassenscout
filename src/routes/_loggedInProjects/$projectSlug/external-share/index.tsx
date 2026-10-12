import { createFileRoute, redirect } from "@tanstack/react-router"
import { PageExternalShare } from "@/src/components/pages/externalShare/PageExternalShare"
import { privateTitleHead } from "@/src/routeHead"
import { externalShareQueryOptions } from "@/src/server/externalShare/externalShareQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/external-share/")({
  head: () => privateTitleHead("Externe Freigabe"),
  ssr: true,
  loader: async ({ context, params }) => {
    const project = await context.queryClient.ensureQueryData(
      projectBySlugQueryOptions(params.projectSlug),
    )

    if (!project.externalShareEnabled) {
      throw redirect({ to: "/$projectSlug", params: { projectSlug: params.projectSlug } })
    }

    await context.queryClient.ensureQueryData(
      externalShareQueryOptions({ projectSlug: params.projectSlug }),
    )
  },
  component: PageExternalShare,
})
