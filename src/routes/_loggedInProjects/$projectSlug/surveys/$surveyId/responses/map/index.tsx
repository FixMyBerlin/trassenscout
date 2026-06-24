import { createFileRoute } from "@tanstack/react-router"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { PageSurveyResponsesMap } from "@/src/components/pages/surveys/PageSurveyResponsesMap"
import { absoluteTitleHead } from "@/src/routeHead"
import { surveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { surveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"
import { surveyTabsQueryOptions } from "@/src/server/surveys/surveyTabsQueryOptions"
import { surveyResponsesSearchSchema } from "@/src/shared/survey-responses/searchSchemas"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/surveys/$surveyId/responses/map/",
)({
  head: () => absoluteTitleHead("Beteiligung"),
  ssr: "data-only",
  pendingComponent: RouteMapShellPending,
  validateSearch: surveyResponsesSearchSchema,
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
  component: PageSurveyResponsesMap,
})
