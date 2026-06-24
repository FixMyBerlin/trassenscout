import { getRouteApi, useLocation, useNavigate } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import {
  parseSurveyResponsesSearch,
  surveyResponsesSearchToRaw,
  type SurveyResponsesSearch,
} from "@/src/shared/survey-responses/searchSchemas"

const surveyResponsesRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/surveys/$surveyId/responses",
)

export function useSurveyResponsesSearchState() {
  const location = useLocation()
  const navigate = useNavigate()
  const routeSearch = surveyResponsesRouteApi.useSearch()
  const search = parseSurveyResponsesSearch(routeSearch)

  const navigateWithSearch = async (nextSearch: SurveyResponsesSearch) => {
    await navigate({
      to: location.pathname,
      search: (previous) => ({
        ...previous,
        ...surveyResponsesSearchToRaw(nextSearch),
      }),
      ...preserveScrollNavigateOptions,
    })
  }

  const setMapSelectionAndDetails = async (ids: number[]) => {
    const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0)))

    await navigateWithSearch({
      ...search,
      selectedResponses: uniqueIds.length > 0 ? uniqueIds : undefined,
      responseDetails: uniqueIds.length === 1 ? uniqueIds[0] : undefined,
    })
  }

  return { search, navigateWithSearch, setMapSelectionAndDetails }
}
