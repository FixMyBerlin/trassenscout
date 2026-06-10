import { queryOptions } from "@tanstack/react-query"
import { getSurveyResponseTopicsByProjectFn } from "./surveyResponseTopics.functions"
import type { GetSurveyResponseTopicsInput } from "./surveyResponseTopics.server"

export function surveyResponseTopicsQueryOptions(input: GetSurveyResponseTopicsInput) {
  return queryOptions({
    queryKey: ["surveyResponseTopics", input],
    queryFn: () => getSurveyResponseTopicsByProjectFn({ data: input }),
  })
}

export type SurveyResponseTopicsResult = Awaited<
  ReturnType<typeof getSurveyResponseTopicsByProjectFn>
>
