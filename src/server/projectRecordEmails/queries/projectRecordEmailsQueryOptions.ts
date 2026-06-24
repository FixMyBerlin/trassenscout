import { queryOptions } from "@tanstack/react-query"
import { getProjectRecordEmailFn, getProjectRecordEmailsFn } from "../projectRecordEmails.functions"
import type { GetProjectRecordEmailsInput } from "../projectRecordEmails.server"

export function projectRecordEmailsQueryOptions(input: GetProjectRecordEmailsInput = {}) {
  return queryOptions({
    queryKey: ["projectRecordEmails", input],
    queryFn: () => getProjectRecordEmailsFn({ data: input }),
  })
}

export function projectRecordEmailQueryOptions(id: number) {
  return queryOptions({
    queryKey: ["projectRecordEmail", id],
    queryFn: () => getProjectRecordEmailFn({ data: { id } }),
  })
}
