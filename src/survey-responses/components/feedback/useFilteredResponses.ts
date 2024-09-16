import { useRouter } from "next/router"
import { AllowedSurveySlugs } from "src/survey-public/utils/allowedSurveySlugs"
import { getResponseConfigBySurveySlug } from "src/survey-public/utils/getConfigBySurveySlug"
import getFeedbackSurveyResponses from "src/survey-responses/queries/getFeedbackSurveyResponses"

export const useFilteredResponses = (
  responses: Awaited<ReturnType<typeof getFeedbackSurveyResponses>>,
  surveySlug: AllowedSurveySlugs,
) => {
  const router = useRouter()
  const { operator, statuses, topics, hasnotes, haslocation, categories, searchterm } = router.query

  const { evaluationRefs } = getResponseConfigBySurveySlug(surveySlug)

  if (!operator || !statuses || !topics || !hasnotes || !haslocation || searchterm === undefined)
    return responses

  // console.log({ operator })
  // console.log({ statuses })
  // console.log({ topics })
  // console.log({ hasnotes })
  // console.log({ haslocation })
  // console.log({ categories })
  // console.log({ searchterm })

  const filtered = responses
    // Handle `operator` which is the `operatorId: number` as 'string'
    .filter((response) => {
      // "All" Case
      if (operator === "ALL") return response
      if (operator === "0") return response.operatorId === null
      if (typeof operator === "string") return response.operatorId === Number(operator)
      // string[] with TS guard that will never trigger
      return operator.map(Number).includes(response.operatorId || 999)
    })
    // Handle `statuses` which is the `status: string` as 'string[]'
    .filter((response) => {
      if (typeof statuses === "string") return response.status === statuses
      // string[] with TS guard that will never trigger
      return statuses.includes(response.status || "NEVER")
    })
    // Handle `topics` which is the `surveyResponseTopics: number[]` as 'string[]'
    .filter((response) => {
      if (topics === "0") return response.surveyResponseTopics.length === 0
      if (typeof topics === "string") return response.surveyResponseTopics.includes(Number(topics))
      // string[]
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
        // @ts-expect-error - searchterm is a string
        response.note?.toLowerCase().includes(searchterm.trim().toLowerCase()) ||
        (response?.data &&
          // @ts-expect-error `data` is of type unkown
          response?.data[evaluationRefs["feedback-usertext-1"]] &&
          // @ts-expect-error `data` is of type unkown
          response?.data[evaluationRefs["feedback-usertext-1"]]
            .toLowerCase()
            // @ts-expect-error - searchterm is a string
            .includes(searchterm.trim().toLowerCase())) ||
        (response?.data &&
          // @ts-expect-error `data` is of type unkown
          response?.data[evaluationRefs["feedback-usertext-2"]] &&
          // @ts-expect-error `data` is of type unkown
          response?.data[evaluationRefs["feedback-usertext-2"]]
            .toLowerCase()
            // @ts-expect-error - searchterm is a string
            .includes(searchterm.trim().toLowerCase()))
      )
    })

  return filtered
}
