import { createFileRoute } from "@tanstack/react-router"
import { PageSurveyAnalysis } from "@/src/components/pages/surveys/PageSurveyAnalysis"
import { absoluteTitleHead } from "@/src/routeHead"
import { surveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"
import { surveyTabsQueryOptions } from "@/src/server/surveys/surveyTabsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/surveys/$surveyId/analysis/")(
  {
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
      ])
      return { survey }
    },
    component: PageSurveyAnalysis,
  },
)
