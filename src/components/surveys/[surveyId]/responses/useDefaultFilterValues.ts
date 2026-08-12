import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import type { SurveyResponseFilter } from "@/src/shared/survey-responses/searchSchemas"

export const useDefaultFilterValues = (slug: AllowedSurveySlugs) => {
  const backendConfig = getConfigBySurveySlug(slug, "backend")
  const surveyResponseStatus = backendConfig.status

  const defaultAdditionalFiltersQueryValues: Record<string, string> = {}

  backendConfig.additionalFilters?.forEach(
    (filter) => (defaultAdditionalFiltersQueryValues[filter.value] = "ALL"),
  )

  return {
    status: surveyResponseStatus.map((s) => s.value),
    searchterm: "",
    ...defaultAdditionalFiltersQueryValues,
  } satisfies SurveyResponseFilter
}
