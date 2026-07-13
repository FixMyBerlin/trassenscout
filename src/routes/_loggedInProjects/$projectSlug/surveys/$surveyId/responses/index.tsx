import { createFileRoute } from "@tanstack/react-router"
import { PageSurveyResponses } from "@/src/components/pages/surveys/PageSurveyResponses"
import { absoluteTitleHead } from "@/src/routeHead"
import { surveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { surveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"
import { surveyTabsQueryOptions } from "@/src/server/surveys/surveyTabsQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/surveys/$surveyId/responses/",
)({
  head: () => absoluteTitleHead("Beteiligung"),
  ssr: true,
  loader: async ({ context, params }) => {
    const surveyId = Number(params.surveyId)
    const [survey] = await Promise.all([
      context.queryClient.ensureQueryData(
        surveyQueryOptions({ projectSlug: params.projectSlug, id: surveyId }),
      ),
      context.queryClient.ensureQueryData(
        surveyTabsQueryOptions({ projectSlug: params.projectSlug, surveyId }),
      ),
      context.queryClient.ensureQueryData(
        surveyResponsesQueryOptions({ projectSlug: params.projectSlug, surveyId }),
      ),
    ])
    return { survey }
  },
  component: PageSurveyResponses,
})
