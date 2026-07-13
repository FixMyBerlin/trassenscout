import { queryOptions } from "@tanstack/react-query"
import { getSurveyResponseUploadsSplitFn, getUploadsFn } from "./uploads.functions"
import type { GetSurveyResponseUploadsSplitInput, GetUploadsInput } from "./uploads.inputSchemas"

export function uploadsQueryOptions(input: GetUploadsInput) {
  return queryOptions({
    queryKey: ["uploads", input],
    queryFn: () => getUploadsFn({ data: input }),
  })
}

export function surveyResponseUploadsSplitQueryOptions(input: GetSurveyResponseUploadsSplitInput) {
  return queryOptions({
    queryKey: ["surveyResponseUploadsSplit", input],
    queryFn: () => getSurveyResponseUploadsSplitFn({ data: input }),
  })
}
