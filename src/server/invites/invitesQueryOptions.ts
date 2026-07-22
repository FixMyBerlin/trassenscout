import { queryOptions } from "@tanstack/react-query"
import { getInviteEmailStatusFn, getInvitesFn } from "./invites.functions"
import type { GetInviteEmailStatusInput, GetInvitesInput } from "./invites.server"

export function invitesQueryOptions(input: GetInvitesInput) {
  return queryOptions({
    queryKey: ["invites", input],
    queryFn: () => getInvitesFn({ data: input }),
  })
}

export function inviteEmailStatusQueryOptions(input: GetInviteEmailStatusInput) {
  return queryOptions({
    queryKey: ["invites", "emailStatus", input.email],
    queryFn: () => getInviteEmailStatusFn({ data: input }),
  })
}
