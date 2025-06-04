import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "../../queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { useFilters } from "./useFilters.nuqs"

export const useFilteredResponses = (
  responses: Awaited<
    ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
  >["feedbackSurveyResponses"],
  surveySlug: AllowedSurveySlugs,
) => {
  const { filter } = useFilters()

  if (!filter) return responses

  const {
    status,
    operator,
    hasnotes,
    haslocation,
    categories,
    topics,
    searchterm,
    ...additionalFilters
  } = filter

  const { additionalFilters: additionalFiltersDefinition } = getConfigBySurveySlug(
    surveySlug,
    "backend",
  )

  const userLocationQuestionId = getQuestionIdBySurveySlug(surveySlug, "location")
  const userCategoryQuestionId = getQuestionIdBySurveySlug(surveySlug, "category")
  const userFeedbackTextQuestionId = getQuestionIdBySurveySlug(surveySlug, "feedbackText")
  const userFeedbackText2QuestionId = getQuestionIdBySurveySlug(surveySlug, "feedbackText2")

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
      if (haslocation === "true") return response.data[userLocationQuestionId]
      // @ts-expect-error `data` is of type unkown
      if (haslocation === "false") return !response.data[userLocationQuestionId]
      return response
    })
    // Handle `categories`
    .filter((response) => {
      if (!categories) return
      // @ts-expect-error `data` is of type unkown
      return categories.includes(String(response.data[userCategoryQuestionId]))
    })
    // Handle `searchterm`
    .filter((response) => {
      if (!searchterm) return response
      return (
        response.note?.toLowerCase().includes(searchterm.trim().toLowerCase()) ||
        response.surveyResponseComments.some((comment) =>
          comment.body.toLowerCase().includes(searchterm.trim().toLowerCase()),
        ) ||
        (response?.data &&
          // @ts-expect-error `data` is of type unkown
          response?.data[userFeedbackTextQuestionId] &&
          // @ts-expect-error `data` is of type unkown
          response?.data[userFeedbackTextQuestionId]
            .toLowerCase()
            .includes(searchterm.trim().toLowerCase())) ||
        (response?.data &&
          // @ts-expect-error `data` is of type unkown
          response?.data[userFeedbackText2QuestionId] &&
          // @ts-expect-error `data` is of type unkown
          response?.data[userFeedbackText2QuestionId]
            .toLowerCase()
            .includes(searchterm.trim().toLowerCase()))
      )
    })
    // Handle additional filters
    .filter((response) => {
      if (!additionalFilters) return response
      return Object.keys(additionalFilters).every((key) => {
        if (additionalFilters[key] === "ALL") return response
        const additionalFiltersConfigItem = additionalFiltersDefinition?.find(
          (filter) => filter.value === key,
        )
        // if the filter is not defined in the backend config (e.g. broken url), we do not filter by it
        if (!additionalFiltersConfigItem) return response
        // on dev and staging we have some surveyresponses (Hinweise) that do not have a first part (Umfrage)
        // so we need to check if the first part exists, here we filter out the surveyresponses that do not have a first part when a filter concerning the first part is used; in production these surveyresponses do not exist
        if (
          additionalFiltersConfigItem?.surveyPart === "survey" &&
          !response.surveySurveyResponseData
        )
          return false
        return additionalFiltersConfigItem?.surveyPart === "feedback"
          ? // @ts-expect-error
            response.data[additionalFiltersConfigItem.id] === additionalFilters[key]
          : // @ts-expect-error
            response.surveySurveyResponseData[additionalFiltersConfigItem.id] ===
              additionalFilters[key]
      })
    })

  return filtered
}
