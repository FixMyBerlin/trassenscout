import { useRouter } from "next/router"
import { type } from "os"
import getFeedbackSurveyResponses from "src/survey-responses/queries/getFeedbackSurveyResponses"

export const useFilteredResponses = (
  responses: Awaited<ReturnType<typeof getFeedbackSurveyResponses>>,
) => {
  const router = useRouter()
  const { operator, statuses, topics, hasnotes } = router.query

  if (!operator || !statuses || !topics || !hasnotes) return responses

  const filtered = responses
    // Handle `operator` which is the `operatorId: number` as 'string'
    .filter((response) => {
      // "All" Case
      if (operator === "0") return response
      if (typeof operator === "string") return response.operatorId === Number(operator)
      // string[] with TS guard that will never trigger
      return operator.map(Number).includes(response.operatorId || 999)
    })
    // Handle `statuses` which is the `status: string` as 'string[]'
    .filter((response) => {
      if (statuses === "ALL") return response
      if (typeof statuses === "string") return response.status === statuses
      // string[] with TS guard that will never trigger
      return statuses.includes(response.status || "NEVER")
    })
    // Handle `topics` which is the `surveyResponseTopics: number[]` as 'string[]'
    .filter((response) => {
      // "All" Case
      if (topics === "ALL") return response
      if (typeof topics === "string") return response.operatorId === Number(operator)
      // string[]
      return topics.map(Number).some((topic) => response.surveyResponseTopics.includes(topic))
    })
    // Handle `hasnotes` which is a boolean
    .filter((response) => {
      if (hasnotes === "ALL") return response
      if (hasnotes === "true") return response.note
      if (hasnotes === "false") return !response.note
      return response
    })

  return filtered
}
