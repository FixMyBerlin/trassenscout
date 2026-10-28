import { queryOptions } from "@tanstack/react-query"
import {
  getProjectRecordEmailInboxFn,
  getProjectRecordEmailInboxItemFn,
} from "../projectRecordEmailInbox.functions"

export function projectRecordEmailInboxQueryOptions(input: { projectSlug: string }) {
  return queryOptions({
    queryKey: ["projectRecordEmailInbox", input],
    queryFn: () => getProjectRecordEmailInboxFn({ data: input }),
  })
}

export function projectRecordEmailInboxItemQueryOptions(input: {
  projectSlug: string
  projectRecordEmailId: number
}) {
  return queryOptions({
    queryKey: ["projectRecordEmailInboxItem", input],
    queryFn: () => getProjectRecordEmailInboxItemFn({ data: input }),
  })
}
