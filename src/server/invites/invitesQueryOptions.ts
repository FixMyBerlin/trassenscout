import { queryOptions } from "@tanstack/react-query"
import { getInvitesFn } from "./invites.functions"
import type { GetInvitesInput } from "./invites.server"

export function invitesQueryOptions(input: GetInvitesInput) {
  return queryOptions({
    queryKey: ["invites", input],
    queryFn: () => getInvitesFn({ data: input }),
  })
}
