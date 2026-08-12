import { createFileRoute } from "@tanstack/react-router"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { PageAdminSurveysSurveyIdResponsesCreated } from "@/src/components/pages/admin/surveys/PageAdminSurveysSurveyIdResponsesCreated"
import { adminTitleHead } from "@/src/routeHead"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { createdSurveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute(
  "/admin/projects/$projectSlug/surveys/$surveyId/responses/created/",
)({
  head: () => adminTitleHead("Nicht-abgeschickte Einträge"),
  ssr: true,
  loader: async ({ context, params }) => {
    const surveyId = Number(params.surveyId)
    await context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug))
    const survey = await context.queryClient.ensureQueryData(adminSurveyQueryOptions(surveyId))
    await context.queryClient.ensureQueryData(
      createdSurveyResponsesQueryOptions({ slug: survey.slug as AllowedSurveySlugs }),
    )
  },
  component: PageAdminSurveysSurveyIdResponsesCreated,
})
