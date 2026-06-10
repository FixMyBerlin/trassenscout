import { createFileRoute } from "@tanstack/react-router"
import { RouteScopedNotFoundPage } from "@/src/components/shared/errors/RouteNotFoundPage"
import { LayoutBeteiligungSurvey } from "@/src/components/shared/layouts/LayoutBeteiligungSurvey"
import { surveyLayoutHead } from "@/src/routeHead"
import { parseBeteiligungSurveySlugRouteParams } from "@/src/server/surveys/beteiligungRouteParams"

export const Route = createFileRoute("/beteiligung/$surveySlug")({
  ssr: true,
  params: { parse: parseBeteiligungSurveySlugRouteParams },
  head: ({ params }) => surveyLayoutHead(params.surveySlug),
  notFoundComponent: RouteScopedNotFoundPage,
  component: LayoutBeteiligungSurvey,
})
