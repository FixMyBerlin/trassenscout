import type { SurveyResponseFilter } from "@/src/shared/survey-responses/searchSchemas"
import { useSurveyResponsesSearchState } from "./useSurveyResponsesSearchState"

type FilterUpdater =
  | SurveyResponseFilter
  | undefined
  | ((previous: SurveyResponseFilter | undefined) => SurveyResponseFilter | undefined)

export function useSurveyResponseFilters() {
  const { search, navigateWithSearch } = useSurveyResponsesSearchState()
  const filter = search.filter

  const setFilter = async (updater: FilterUpdater) => {
    const next = typeof updater === "function" ? updater(search.filter) : updater

    await navigateWithSearch({
      ...search,
      filter: next,
    })
  }

  return { filter, setFilter }
}
