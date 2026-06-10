import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import {
  getAllProjectRecordsAdminFn,
  getProjectRecordAdminFn,
  getProjectRecordDeleteInfoFn,
  getProjectRecordFn,
  getProjectRecordsFn,
  getProjectRecordsNeedsReviewFn,
  getProjectRecordsTabCountsFn,
} from "./projectRecords.functions"
import type { GetProjectRecordsInput } from "./projectRecords.server"
import { GetProjectRecordSchema } from "./projectRecords.server"

export function allProjectRecordsAdminQueryOptions() {
  return queryOptions({
    queryKey: ["projectRecordsAdmin"],
    queryFn: () => getAllProjectRecordsAdminFn(),
  })
}

export function projectRecordAdminQueryOptions(id: number) {
  return queryOptions({
    queryKey: ["projectRecordAdmin", id],
    queryFn: () => getProjectRecordAdminFn({ data: { id } }),
  })
}

export function projectRecordsQueryOptions(input: GetProjectRecordsInput) {
  return queryOptions({
    queryKey: ["projectRecords", input],
    queryFn: () => getProjectRecordsFn({ data: input }),
  })
}

export function projectRecordsNeedsReviewQueryOptions(input: GetProjectRecordsInput) {
  return queryOptions({
    queryKey: ["projectRecordsNeedsReview", input],
    queryFn: () => getProjectRecordsNeedsReviewFn({ data: input }),
  })
}

export function projectRecordsTabCountsQueryOptions(input: GetProjectRecordsInput) {
  return queryOptions({
    queryKey: ["projectRecordsTabCounts", input],
    queryFn: () => getProjectRecordsTabCountsFn({ data: input }),
  })
}

export function projectRecordQueryOptions(input: z.infer<typeof GetProjectRecordSchema>) {
  return queryOptions({
    queryKey: ["projectRecord", input],
    queryFn: () => getProjectRecordFn({ data: input }),
  })
}

export function projectRecordDeleteInfoQueryOptions(input: z.infer<typeof GetProjectRecordSchema>) {
  return queryOptions({
    queryKey: ["projectRecordDeleteInfo", input],
    queryFn: () => getProjectRecordDeleteInfoFn({ data: input }),
  })
}
