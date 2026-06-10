import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import {
  serializeSurveyResponseFilterParam,
  surveyResponsesSearchToRaw,
  type SurveyResponseFilter,
  type SurveyResponsesSearch,
} from "@/src/shared/survey-responses/searchSchemas"

const surveyResponsesRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/surveys/$surveyId/responses/",
)

type FilterUpdater =
  | SurveyResponseFilter
  | undefined
  | ((previous: SurveyResponseFilter | undefined) => SurveyResponseFilter | undefined)

export function useSurveyResponseFilters() {
  const search = surveyResponsesRouteApi.useSearch()
  const navigate = surveyResponsesRouteApi.useNavigate()
  const filter = search.filter

  const setFilter = async (updater: FilterUpdater) => {
    await navigate({
      search: (previous: SurveyResponsesSearch) => {
        const next = typeof updater === "function" ? updater(previous.filter) : updater
        return {
          ...surveyResponsesSearchToRaw(previous),
          filter: serializeSurveyResponseFilterParam(next),
        }
      },
      ...preserveScrollNavigateOptions,
    })
  }

  return { filter, setFilter }
}
