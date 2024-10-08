import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { TResponse, TSingleOrMultiResponseProps } from "@/src/survey-public/components/types"
import {
  getBackendConfigBySurveySlug,
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { FilterSchema } from "./useFilters.nuqs"

export const useDefaultFilterValues = (): FilterSchema => {
  const projectSlug = useProjectSlug()
  const surveyId = useParam("surveyId", "string")
  const [{ slug }] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })
  const [{ surveyResponseTopics: topics }] = useQuery(getSurveyResponseTopicsByProject, {
    projectSlug,
  })

  const backendConfig = getBackendConfigBySurveySlug(slug)
  const surveyResponseStatus = backendConfig.status

  const { evaluationRefs } = getResponseConfigBySurveySlug(slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(slug)

  const feedbackQuestions = []
  for (let page of feedbackDefinition.pages) {
    feedbackQuestions.push(...page.questions)
  }
  const categoryQuestionProps = feedbackQuestions.find(
    (q) => q.id === evaluationRefs["feedback-category"],
  )!.props as TSingleOrMultiResponseProps

  const defaultAdditionalFiltersQueryValues: Record<string, string> = {}
  backendConfig.additionalFilters?.forEach(
    (filter) => (defaultAdditionalFiltersQueryValues[filter.value] = "ALL"),
  )
  // @ts-expect-error todo zod filter
  return {
    status: [...surveyResponseStatus.map((s) => s.value)],
    operator: "ALL",
    hasnotes: "ALL",
    haslocation: "ALL",
    categories: [...categoryQuestionProps.responses.map((r: TResponse) => String(r.id))],
    topics: [...topics.map((t) => String(t.id)), "0"],
    searchterm: "",
    ...defaultAdditionalFiltersQueryValues,
  }
}
