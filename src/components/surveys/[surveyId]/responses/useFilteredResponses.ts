import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import type { SurveyResponseTagsResult } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"
import { useSurveyResponseFilters } from "./useSurveyResponseFilters"

function toFilterValueList(value: unknown) {
  const values = Array.isArray(value) ? value : [value]
  return values
    .filter((item) => item !== null && item !== undefined && item !== "")
    .map((item) => String(item))
}

function responseValueMatchesFilter(responseValue: unknown, filterValue: unknown) {
  if (filterValue === "ALL") return true

  const selectedValues = toFilterValueList(filterValue)
  if (selectedValues.length === 0) return true

  const responseValues = toFilterValueList(responseValue)
  return responseValues.some((value) => selectedValues.includes(value))
}

export const useFilteredResponses = (
  responses: FeedbackSurveyResponse[],
  surveySlug: AllowedSurveySlugs,
  topicsDefinition: SurveyResponseTagsResult["surveyResponseTags"],
) => {
  const { filter } = useSurveyResponseFilters()

  if (!filter) return responses

  const { status, searchterm, ...additionalFilters } = filter

  const backendConfig = getConfigBySurveySlug(surveySlug, "backend")
  const activeStatuses =
    status.length > 0 ? status : backendConfig.status.map((statusItem) => statusItem.value)

  const userFeedbackTextQuestionId = getQuestionIdBySurveySlug(surveySlug, "feedbackText")
  const userFeedbackText2QuestionId = getQuestionIdBySurveySlug(surveySlug, "feedbackText_2")
  const topicTitleById = new Map(
    topicsDefinition.map((topic) => [topic.id, normalizeSearchterm(topic.title)]),
  )
  const knownTagTitles = new Set(topicTitleById.values())

  const filtered = responses
    .filter((response) => {
      return activeStatuses.includes(response.status || "NEVER")
    })
    .filter((response) => {
      if (!searchterm) return response
      const cleanedSearchterm = normalizeSearchterm(searchterm)
      if (!cleanedSearchterm) return response

      const tagSearchterm = cleanedSearchterm.startsWith("tag:")
        ? cleanedSearchterm.slice("tag:".length).trim()
        : null
      const responseTagTitles = response.surveyResponseTags
        .map((tagId) => topicTitleById.get(tagId))
        .filter((title): title is string => Boolean(title))

      if (tagSearchterm !== null) {
        if (!tagSearchterm) return response

        if (knownTagTitles.has(tagSearchterm)) {
          return responseTagTitles.some((title) => title === tagSearchterm)
        }

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
    .filter((response) => {
      if (!additionalFilters) return true
      return Object.keys(additionalFilters).every((key) => {
        if (additionalFilters[key] === "ALL") return true

        const additionalFiltersConfigItem = backendConfig.additionalFilters?.find(
          (filter) => filter.value === key,
        )
        if (!additionalFiltersConfigItem) return true
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
            return responseValueMatchesFilter(
              response.surveyPart1ResponseData?.[additionalFiltersConfigItem.id],
              additionalFilters[key],
            )
          case "part2":
            return responseValueMatchesFilter(
              response.data[additionalFiltersConfigItem.id],
              additionalFilters[key],
            )
          case "part3":
            return responseValueMatchesFilter(
              response.surveyPart3ResponseData?.[additionalFiltersConfigItem.id],
              additionalFilters[key],
            )
          default:
            return true
        }
      })
    })

  return filtered
}
