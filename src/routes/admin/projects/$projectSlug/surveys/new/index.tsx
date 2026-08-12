import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSurveysNew } from "@/src/components/pages/admin/surveys/PageAdminSurveysNew"
import { adminTitleHead } from "@/src/routeHead"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/projects/$projectSlug/surveys/new/")({
  head: () => adminTitleHead("Neue Beteiligung erstellen"),
  ssr: true,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug)),
      context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
    ]),
  component: PageAdminSurveysNew,
})
