import { queryOptions } from "@tanstack/react-query"
import {
  getSurveyResponseTagsByProjectFn,
  getSurveyResponseTagsWithUsageCountFn,
} from "./surveyResponseTags.functions"
import type { GetSurveyResponseTagsInput } from "./surveyResponseTags.server"

export function surveyResponseTagsQueryOptions(input: GetSurveyResponseTagsInput) {
  return queryOptions({
    queryKey: ["surveyResponseTags", input],
    queryFn: () => getSurveyResponseTagsByProjectFn({ data: input }),
  })
}

export function surveyResponseTagsWithUsageCountQueryOptions(input: GetSurveyResponseTagsInput) {
  return queryOptions({
    queryKey: ["surveyResponseTags", "withUsageCount", input],
    queryFn: () => getSurveyResponseTagsWithUsageCountFn({ data: input }),
  })
}

export type SurveyResponseTagsResult = Awaited<ReturnType<typeof getSurveyResponseTagsByProjectFn>>
