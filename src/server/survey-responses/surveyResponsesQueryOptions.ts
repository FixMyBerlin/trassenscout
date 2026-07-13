import { queryOptions } from "@tanstack/react-query"
import {
  getFeedbackSurveyResponsesWithSurveyDataAndCommentsFn,
  getGroupedSurveyResponsesFn,
  getLinkedSurveyResponseForSubsubsectionFn,
  getCreatedSurveyResponsesFn,
  getSurveyResponsesFn,
  getTestSurveyResponsesFn,
} from "./surveyResponses.functions"
import type {
  GetCreatedSurveyResponsesInput,
  GetFeedbackSurveyResponsesInput,
  GetGroupedSurveyResponsesInput,
  GetLinkedSurveyResponseForSubsubsectionInput,
  GetSurveyResponsesInput,
  GetTestSurveyResponsesInput,
} from "./surveyResponses.server"

export function surveyResponsesQueryOptions(input: GetSurveyResponsesInput) {
  return queryOptions({
    queryKey: ["surveyResponses", input],
    queryFn: () => getSurveyResponsesFn({ data: input }),
  })
}

export function createdSurveyResponsesQueryOptions(input: GetCreatedSurveyResponsesInput) {
  return queryOptions({
    queryKey: ["createdSurveyResponses", input],
    queryFn: () => getCreatedSurveyResponsesFn({ data: input }),
  })
}

export function testSurveyResponsesQueryOptions(input: GetTestSurveyResponsesInput) {
  return queryOptions({
    queryKey: ["testSurveyResponses", input],
    queryFn: () => getTestSurveyResponsesFn({ data: input }),
  })
}

export function feedbackSurveyResponsesQueryOptions(input: GetFeedbackSurveyResponsesInput) {
  return queryOptions({
    queryKey: ["feedbackSurveyResponses", input],
    queryFn: () => getFeedbackSurveyResponsesWithSurveyDataAndCommentsFn({ data: input }),
  })
}

export function groupedSurveyResponsesQueryOptions(input: GetGroupedSurveyResponsesInput) {
  return queryOptions({
    queryKey: ["groupedSurveyResponses", input],
    queryFn: () => getGroupedSurveyResponsesFn({ data: input }),
  })
}

export function linkedSurveyResponseForSubsubsectionQueryOptions(
  input: GetLinkedSurveyResponseForSubsubsectionInput,
) {
  return queryOptions({
    queryKey: ["linkedSurveyResponseForSubsubsection", input],
    queryFn: () => getLinkedSurveyResponseForSubsubsectionFn({ data: input }),
  })
}

import type { getFeedbackSurveyResponsesWithSurveyDataAndComments } from "./surveyResponses.server"

export type FeedbackSurveyResponsesResult = Awaited<
  ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
>
export type FeedbackSurveyResponse =
  FeedbackSurveyResponsesResult["feedbackSurveyResponses"][number]
