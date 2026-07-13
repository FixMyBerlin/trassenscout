import { queryOptions } from "@tanstack/react-query"
import { getOptionalCurrentUserFn } from "./publicCurrentUser.functions"
import {
  getCurrentUserFn,
  getUsersAdminFn,
  getUsersWithMembershipsFn,
  getUserWithMembershipsFn,
} from "./users.functions"

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUserFn(),
  })
}

export function optionalCurrentUserQueryOptions() {
  return queryOptions({
    queryKey: ["currentUser", "optional"],
    queryFn: () => getOptionalCurrentUserFn(),
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

export function userWithMembershipsQueryOptions(userId: number) {
  return queryOptions({
    queryKey: ["users", "withMemberships", userId],
    queryFn: () => getUserWithMembershipsFn({ data: { userId } }),
  })
}
