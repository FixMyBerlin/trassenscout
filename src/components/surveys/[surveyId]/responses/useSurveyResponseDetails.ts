import { useSurveyResponsesSearchState } from "./useSurveyResponsesSearchState"

export function useSurveyResponseDetails() {
  const { search, navigateWithSearch } = useSurveyResponsesSearchState()

  const responseDetails = search.responseDetails ?? 0

  const setResponseDetails = async (id: number | null) => {
    await navigateWithSearch({
      ...search,
      responseDetails: id ?? undefined,
    })
  }

  return { responseDetails, setResponseDetails }
}
