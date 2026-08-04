import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import type { SurveyResponseTagsResult } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"
import { useSurveyResponseFilters } from "./useSurveyResponseFilters"

export const useFilteredResponses = (
  responses: FeedbackSurveyResponse[],
  surveySlug: AllowedSurveySlugs,
  topicsDefinition: SurveyResponseTagsResult["surveyResponseTags"],
) => {
  const { filter } = useSurveyResponseFilters()

  if (!filter) return responses

  const { status, searchterm, ...additionalFilters } = filter

  const { additionalFilters: additionalFiltersDefinition } = getConfigBySurveySlug(
    surveySlug,
    "backend",
  )

  const userFeedbackTextQuestionId = getQuestionIdBySurveySlug(surveySlug, "feedbackText")
  const userFeedbackText2QuestionId = getQuestionIdBySurveySlug(surveySlug, "feedbackText2")
  const topicTitleById = new Map(
    topicsDefinition.map((topic) => [topic.id, topic.title.trim().toLowerCase()]),
  )

  const filtered = responses
    .filter((response) => {
      return status.includes(response.status || "NEVER")
    })
    // Handle `searchterm`
    .filter((response) => {
      if (!searchterm) return response
      const cleanedSearchterm = searchterm.trim().toLowerCase().replace(/^#/, "")
      const tagSearchterm = cleanedSearchterm.startsWith("tag:")
        ? cleanedSearchterm.slice("tag:".length).trim()
        : null
      const responseTagTitles = response.surveyResponseTags
        .map((tagId) => topicTitleById.get(tagId))
        .filter((title): title is string => Boolean(title))

      if (tagSearchterm !== null) {
        return responseTagTitles.some((title) => title.includes(tagSearchterm))
      }

      return (
        response.note?.toLowerCase().includes(cleanedSearchterm) ||
        response.surveyResponseComments.some((comment: { body: string }) =>
          comment.body.toLowerCase().includes(cleanedSearchterm),
        ) ||
        responseTagTitles.some((title) => title.includes(cleanedSearchterm)) ||
        (response?.data[userFeedbackTextQuestionId] &&
          String(response.data[userFeedbackTextQuestionId])
            .toLowerCase()
            .includes(cleanedSearchterm)) ||
        (response?.data[userFeedbackText2QuestionId] &&
          String(response.data[userFeedbackText2QuestionId])
            .toLowerCase()
            .includes(cleanedSearchterm))
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
          additionalFiltersConfigItem?.surveyPart === "part1" &&
          !response.surveyPart1ResponseData
        )
          return false
        if (
          additionalFiltersConfigItem?.surveyPart === "part3" &&
          !response.surveyPart3ResponseData
        )
          return false
        switch (additionalFiltersConfigItem?.surveyPart) {
          case "part1":
            return (
              response.surveyPart1ResponseData?.[additionalFiltersConfigItem.id] ===
              additionalFilters[key]
            )
          case "part2":
            return response.data[additionalFiltersConfigItem.id] === additionalFilters[key]
          case "part3":
            return (
              response.surveyPart3ResponseData?.[additionalFiltersConfigItem.id] ===
              additionalFilters[key]
            )
          default:
            // If surveyPart is not recognized, don't filter
            return true
        }
      })
    })

  return filtered
}
