import { createFileRoute, redirect } from "@tanstack/react-router"
import { PageSurveys } from "@/src/components/pages/surveys/PageSurveys"
import { privateTitleHead } from "@/src/routeHead"
import { surveysQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/surveys/")({
  head: () => privateTitleHead("Beteiligungen"),
  ssr: true,
  loader: async ({ context, params }) => {
    const surveys = await context.queryClient.ensureQueryData(
      surveysQueryOptions({ projectSlug: params.projectSlug }),
    )
    if (surveys.length === 1) {
      throw redirect({
        to: "/$projectSlug/surveys/$surveyId/responses",
        params: { projectSlug: params.projectSlug, surveyId: String(surveys[0]!.id) },
      })
    }
    return surveys
  },
  component: PageSurveys,
})
