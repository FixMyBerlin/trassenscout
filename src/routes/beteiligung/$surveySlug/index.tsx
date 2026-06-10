import { createFileRoute, notFound } from "@tanstack/react-router"
import { PageBeteiligungSurveySlug } from "@/src/components/pages/beteiligung/PageBeteiligungSurveySlug"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { parseBeteiligungSurveySlugRouteParams } from "@/src/server/surveys/beteiligungRouteParams"
import { getPublicSurveyBySlugFn } from "@/src/server/surveys/publicSurveys.functions"
import { NotFoundError } from "@/src/shared/auth/errors"
import { beteiligungSurveySearchSchema } from "@/src/shared/surveys/searchSchemas"

export const Route = createFileRoute("/beteiligung/$surveySlug/")({
  ssr: "data-only",
  params: { parse: parseBeteiligungSurveySlugRouteParams },
  validateSearch: beteiligungSurveySearchSchema,
  pendingComponent: RouteMapShellPending,
  loader: async ({ params }) => {
    try {
      return await getPublicSurveyBySlugFn({ data: { slug: params.surveySlug } })
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw notFound()
      }
      throw error
    }
  },
  component: PageBeteiligungSurveySlug,
})
