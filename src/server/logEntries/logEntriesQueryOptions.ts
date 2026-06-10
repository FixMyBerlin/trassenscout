import { queryOptions } from "@tanstack/react-query"
import { getGeneralLogEntriesFn, getProjectLogEntriesFn } from "./logEntries.functions"

export function generalLogEntriesQueryOptions() {
  return queryOptions({
    queryKey: ["logEntries", "general"],
    queryFn: () => getGeneralLogEntriesFn(),
  })
}

export function projectLogEntriesQueryOptions(input: {
  projectSlug: string
  projectId: number
  take?: number
}) {
  return queryOptions({
    queryKey: ["logEntries", "project", input.projectSlug, input.projectId],
    queryFn: () => getProjectLogEntriesFn({ data: input }),
  })
}
