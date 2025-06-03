import { useProjectSlug } from "@/src/core/routes/useProjectSlug"

import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"

import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { getSurveyCategoryOptions } from "@/src/survey-responses/utils/getSurveyCategoryOptions"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { FilterSchema } from "./useFilters.nuqs"

export const useDefaultFilterValues = () => {
  const projectSlug = useProjectSlug()
  const surveyId = useParam("surveyId", "string")
  const [{ slug }] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })
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
