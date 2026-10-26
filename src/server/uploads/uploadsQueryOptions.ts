import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"
import {
  getMyUploadsFn,
  getMyUploadTagsFn,
  getSurveyResponseUploadsSplitFn,
  getUploadsFn,
} from "./uploads.functions"
import type {
  GetMyUploadsInput,
  GetMyUploadTagsInput,
  GetSurveyResponseUploadsSplitInput,
  GetUploadsInput,
} from "./uploads.inputSchemas"

export function uploadsQueryOptions(input: GetUploadsInput) {
  return queryOptions({
    queryKey: ["uploads", input],
    queryFn: () => getUploadsFn({ data: input }),
  })
}

export function myUploadsInfiniteQueryOptions(input: Omit<GetMyUploadsInput, "cursor">) {
  return infiniteQueryOptions({
    queryKey: [
      "uploads",
      "mine",
      "list",
      input.projectSlug ?? null,
      input.searchterm ?? null,
      input.tag ?? null,
    ],
    queryFn: ({ pageParam }) =>
      getMyUploadsFn({ data: { ...input, cursor: pageParam ?? undefined } }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // Infinite queries refetch every loaded page; keep that off the focus event.
    refetchOnWindowFocus: false,
  })
}

export function myUploadTagsQueryOptions(input: GetMyUploadTagsInput) {
  return queryOptions({
    queryKey: ["uploads", "mine", "tags", input.projectSlug ?? null],
    queryFn: () => getMyUploadTagsFn({ data: input }),
  })
}

export function surveyResponseUploadsSplitQueryOptions(input: GetSurveyResponseUploadsSplitInput) {
  return queryOptions({
    queryKey: ["surveyResponseUploadsSplit", input],
    queryFn: () => getSurveyResponseUploadsSplitFn({ data: input }),
  })
}
