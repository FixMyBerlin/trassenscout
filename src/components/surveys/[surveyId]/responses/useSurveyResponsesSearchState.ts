import { useLocation, useNavigate } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import {
  surveyResponsesSearchSchema,
  surveyResponsesSearchToRaw,
  type SurveyResponsesSearch,
} from "@/src/shared/survey-responses/searchSchemas"

export function useSurveyResponsesSearchState() {
  const location = useLocation()
  const navigate = useNavigate()
  const routeSearch = useTryRouteSearch()
  const search = surveyResponsesSearchSchema.parse(routeSearch ?? {})

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
