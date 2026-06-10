import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSurveysSurveyIdResponses } from "@/src/components/pages/admin/surveys/PageAdminSurveysSurveyIdResponses"
import { adminTitleHead } from "@/src/routeHead"
import { surveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/admin/surveys/$surveyId/responses/")({
  head: () => adminTitleHead("Beiträge"),
  ssr: true,
  loader: async ({ context, params }) => {
    const surveyId = Number(params.surveyId)
    const survey = await context.queryClient.ensureQueryData(adminSurveyQueryOptions(surveyId))
    await context.queryClient.ensureQueryData(
      surveyResponsesQueryOptions({ projectSlug: survey.project.slug, surveyId }),
    )
  },
  component: PageAdminSurveysSurveyIdResponses,
})
