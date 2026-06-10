import { createFileRoute } from "@tanstack/react-router"
import { PageSurveys } from "@/src/components/pages/surveys/PageSurveys"
import { privateTitleHead } from "@/src/routeHead"
import { surveysQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/surveys/")({
  head: () => privateTitleHead("Beteiligungen"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(surveysQueryOptions({ projectSlug: params.projectSlug })),
  component: PageSurveys,
})
