import { getSurveyCategoryOptions } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getSurveyCategoryOptions"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSurveyResponseTopicsByProject from "@/src/server/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { useQuery } from "@blitzjs/rpc"
import { FilterSchema } from "./useFilters.nuqs"

export const useDefaultFilterValues = (slug: AllowedSurveySlugs) => {
  const projectSlug = useProjectSlug()
  const [{ surveyResponseTopics: topics }] = useQuery(getSurveyResponseTopicsByProject, {
    projectSlug,
  })

  const backendConfig = getConfigBySurveySlug(slug, "backend")
  const surveyResponseStatus = backendConfig.status

  const categoryOptions = getSurveyCategoryOptions(slug)
  const defaultAdditionalFiltersQueryValues: Record<string, string> = {}

  backendConfig.additionalFilters?.forEach(
    (filter) => (defaultAdditionalFiltersQueryValues[filter.value] = "ALL"),
  )

  return {
    status: [...surveyResponseStatus.map((s) => s.value)],
    operator: "ALL",
    hasnotes: "ALL",
    haslocation: "ALL",
    categories: [...categoryOptions.map((c) => String(c.value))],
    topics: [...topics.map((t) => String(t.id)), "0"],
    searchterm: "",
    ...defaultAdditionalFiltersQueryValues,
  } satisfies FilterSchema
}
