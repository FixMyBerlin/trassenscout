import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSurveysSurveyIdResponses } from "@/src/components/pages/admin/surveys/PageAdminSurveysSurveyIdResponses"
import { adminTitleHead } from "@/src/routeHead"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { surveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/admin/projects/$projectSlug/surveys/$surveyId/responses/")({
  head: () => adminTitleHead("Eingaben"),
  ssr: true,
  loader: async ({ context, params }) => {
    const surveyId = Number(params.surveyId)
    await context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug))
    await context.queryClient.ensureQueryData(adminSurveyQueryOptions(surveyId))
    await context.queryClient.ensureQueryData(
      surveyResponsesQueryOptions({ projectSlug: params.projectSlug, surveyId }),
    )
  },
  component: PageAdminSurveysSurveyIdResponses,
})
