import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { surveyResponsesSearchToRaw } from "@/src/shared/survey-responses/searchSchemas"

const surveyResponsesRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/surveys/$surveyId/responses/",
)

export function useSurveyResponseDetails() {
  const search = surveyResponsesRouteApi.useSearch()
  const navigate = surveyResponsesRouteApi.useNavigate()

  const responseDetails = search.responseDetails ? Number.parseInt(search.responseDetails, 10) : 0

  const setResponseDetails = async (id: number | null) => {
    await navigate({
      search: (previous) => ({
        ...surveyResponsesSearchToRaw(previous),
        responseDetails: id ? String(id) : undefined,
      }),
      ...preserveScrollNavigateOptions,
    })
  }

  return { responseDetails, setResponseDetails }
}
