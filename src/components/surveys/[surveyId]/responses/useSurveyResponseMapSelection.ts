import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { surveyResponsesSearchToRaw } from "@/src/shared/survey-responses/searchSchemas"

const surveyResponsesRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/surveys/$surveyId/responses/",
)

export function useSurveyResponseMapSelection(defaultIds: number[]) {
  const search = surveyResponsesRouteApi.useSearch()
  const navigate = surveyResponsesRouteApi.useNavigate()

  const mapSelection = search.selectedResponses ?? defaultIds

  const setMapSelection = async (ids: number[]) => {
    await navigate({
      search: (previous) => ({
        ...surveyResponsesSearchToRaw(previous),
        selectedResponses: ids.length > 0 ? ids.join(",") : undefined,
      }),
      ...preserveScrollNavigateOptions,
    })
  }

  return { mapSelection, setMapSelection }
}
