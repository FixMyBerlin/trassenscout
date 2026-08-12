import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSurveys } from "@/src/components/pages/admin/surveys/PageAdminSurveys"
import { adminTitleHead } from "@/src/routeHead"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { adminSurveysByProjectQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/admin/projects/$projectSlug/surveys/")({
  head: ({ params }) => adminTitleHead(`Beteiligungen: ${params.projectSlug}`),
  ssr: true,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug))
    await context.queryClient.ensureQueryData(adminSurveysByProjectQueryOptions(params.projectSlug))
  },
  component: PageAdminSurveys,
})
