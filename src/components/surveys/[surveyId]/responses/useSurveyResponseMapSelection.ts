import { useSurveyResponsesSearchState } from "./useSurveyResponsesSearchState"

export function useSurveyResponseMapSelection(defaultIds: number[]) {
  const { search, navigateWithSearch, setMapSelectionAndDetails } = useSurveyResponsesSearchState()

  const mapSelection = search.selectedResponses ?? defaultIds

  const setMapSelection = async (ids: number[]) => {
    await navigateWithSearch({
      ...search,
      selectedResponses: ids.length > 0 ? ids : undefined,
    })
  }

  return { mapSelection, setMapSelection, setMapSelectionAndDetails }
}
