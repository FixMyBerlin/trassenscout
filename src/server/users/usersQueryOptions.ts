import { queryOptions } from "@tanstack/react-query"
import { getCurrentUserFn, getUsersAdminFn, getUsersWithMembershipsFn } from "./users.functions"

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUserFn(),
  })
}
export function usersAdminQueryOptions() {
  return queryOptions({
    queryKey: ["users", "admin"],
    queryFn: () => getUsersAdminFn({ data: {} }),
  })
}

export function usersWithMembershipsQueryOptions() {
  return queryOptions({
    queryKey: ["users", "withMemberships"],
    queryFn: () => getUsersWithMembershipsFn({ data: {} }),
  })
}
