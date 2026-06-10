import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitleSlug } from "@/src/components/core/components/text/titles"
import { PageProjectEdit } from "@/src/components/pages/projects/PageProjectEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/edit/")({
  head: ({ params }) => absoluteTitleHead(seoEditTitleSlug(params.projectSlug)),
  ssr: true,
  loader: async ({ context, params }) => {
    const [project] = await Promise.all([
      context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug)),
      context.queryClient.ensureQueryData(
        projectUsersQueryOptions({ projectSlug: params.projectSlug }),
      ),
    ])
    return { project }
  },
  component: PageProjectEdit,
})
