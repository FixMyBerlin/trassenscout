import { createFileRoute } from "@tanstack/react-router"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { PageAdminSurveysSurveyIdResponsesTest } from "@/src/components/pages/admin/surveys/PageAdminSurveysSurveyIdResponsesTest"
import { adminTitleHead } from "@/src/routeHead"
import { testSurveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/admin/surveys/$surveyId/responses/test/")({
  head: () => adminTitleHead("Beteiligung bearbeiten erstellen"),
  ssr: true,
  loader: async ({ context, params }) => {
    const surveyId = Number(params.surveyId)
    const survey = await context.queryClient.ensureQueryData(adminSurveyQueryOptions(surveyId))
    await context.queryClient.ensureQueryData(
      testSurveyResponsesQueryOptions({ slug: survey.slug as AllowedSurveySlugs }),
    )
  },
  component: PageAdminSurveysSurveyIdResponsesTest,
})
