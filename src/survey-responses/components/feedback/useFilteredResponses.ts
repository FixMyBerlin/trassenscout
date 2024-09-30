import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { getResponseConfigBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import getFeedbackSurveyResponses from "@/src/survey-responses/queries/getFeedbackSurveyResponses"
import { parseAsJson, useQueryState } from "nuqs"
import { filterSchema } from "./EditableSurveyResponseFilterForm"

export const useFilteredResponses = (
  responses: Awaited<ReturnType<typeof getFeedbackSurveyResponses>>,
  surveySlug: AllowedSurveySlugs,
) => {
  const [filter] = useQueryState("filter", parseAsJson(filterSchema.parse))

  if (!filter) return responses

  const { status, operator, hasnotes, haslocation, categories, topics, searchterm } = filter

  const { evaluationRefs } = getResponseConfigBySurveySlug(surveySlug)

  const filtered = responses
    .filter((response) => {
      return status.includes(response.status || "NEVER")
    })
    // Handle `operator` which is the `operatorId: number` as 'string'
    .filter((response) => {
      if (operator === "ALL") return response
      if (operator === "0") return response.operatorId === null
      if (typeof operator === "string") return response.operatorId === Number(operator)
    })
    // Handle `topics` which is the `surveyResponseTopics: number[]` as 'string[]'
    .filter((response) => {
      if (topics.includes("0"))
        return (
          topics.map(Number).some((topic) => response.surveyResponseTopics.includes(topic)) ||
          response.surveyResponseTopics.length === 0
        )
      return topics.map(Number).some((topic) => response.surveyResponseTopics.includes(topic))
    })
    // Handle `hasnotes`
    .filter((response) => {
      if (hasnotes === "ALL") return response
      if (hasnotes === "true") return response.note
      if (hasnotes === "false") return !response.note
      return response
    })
    // Handle `haslocation`
    .filter((response) => {
      if (haslocation === "ALL") return response
      // @ts-expect-error `data` is of type unkown
      if (haslocation === "true") return response.data[evaluationRefs["feedback-location"]]
      // @ts-expect-error `data` is of type unkown
      if (haslocation === "false") return !response.data[evaluationRefs["feedback-location"]]
      return response
    })
    // Handle `categories`
    .filter((response) => {
      if (!categories) return
      // @ts-expect-error `data` is of type unkown
      return categories.includes(String(response.data[evaluationRefs["feedback-category"]]))
    })
    // Handle `searchterm`
    .filter((response) => {
      if (!searchterm) return response
      return (
        response.note?.toLowerCase().includes(searchterm.trim().toLowerCase()) ||
        (response?.data &&
          // @ts-expect-error `data` is of type unkown
          response?.data[evaluationRefs["feedback-usertext-1"]] &&
          // @ts-expect-error `data` is of type unkown
          response?.data[evaluationRefs["feedback-usertext-1"]]
            .toLowerCase()
            .includes(searchterm.trim().toLowerCase())) ||
        (response?.data &&
          // @ts-expect-error `data` is of type unkown
          response?.data[evaluationRefs["feedback-usertext-2"]] &&
          // @ts-expect-error `data` is of type unkown
          response?.data[evaluationRefs["feedback-usertext-2"]]
            .toLowerCase()
            .includes(searchterm.trim().toLowerCase()))
      )
    })

  return filtered
}
