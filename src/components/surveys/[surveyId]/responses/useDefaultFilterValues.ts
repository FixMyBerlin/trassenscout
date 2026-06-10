import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getSurveyCategoryOptions } from "@/src/components/surveys/[surveyId]/responses/getSurveyCategoryOptions"
import { surveyResponseTopicsQueryOptions } from "@/src/server/survey-response-topics/surveyResponseTopicsQueryOptions"
import type { SurveyResponseFilter } from "@/src/shared/survey-responses/searchSchemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export const useDefaultFilterValues = (slug: AllowedSurveySlugs) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data } = useQuery(surveyResponseTopicsQueryOptions({ projectSlug }))
  const topics = data?.surveyResponseTopics ?? []

  const backendConfig = getConfigBySurveySlug(slug, "backend")
  const surveyResponseStatus = backendConfig.status

  const categoryOptions = getSurveyCategoryOptions(slug)
  const defaultAdditionalFiltersQueryValues: Record<string, string> = {}

  backendConfig.additionalFilters?.forEach(
    (filter) => (defaultAdditionalFiltersQueryValues[filter.value] = "ALL"),
  )

  return {
    status: surveyResponseStatus.map((s) => s.value),
    operator: "ALL",
    hasnotes: "ALL",
    haslocation: "ALL",
    categories: categoryOptions.map((c) => String(c.value)),
    topics: [...topics.map((t) => String(t.id)), "0"],
    searchterm: "",
    ...defaultAdditionalFiltersQueryValues,
  } satisfies SurveyResponseFilter
}
