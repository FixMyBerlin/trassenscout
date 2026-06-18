import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { UpdateUserSchema } from "@/src/shared/auth/schemas"
import {
  GetUsersAdminSchema,
  GetUsersWithMembershipsSchema,
  GetUserWithMembershipsSchema,
} from "./users.inputSchemas"
import {
  getCurrentUser,
  getUsersAdmin,
  getUsersWithMemberships,
  getUserWithMemberships,
  updateCurrentUser,
} from "./users.server"
export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(() =>
  getCurrentUser(getRequestHeaders()),
)

export const getUsersAdminFn = createServerFn({ method: "GET" })
  .validator(GetUsersAdminSchema)
  .handler(() => getUsersAdmin(getRequestHeaders()))

export const getUsersWithMembershipsFn = createServerFn({ method: "GET" })
  .validator(GetUsersWithMembershipsSchema)
  .handler(() => getUsersWithMemberships(getRequestHeaders()))

export const getUserWithMembershipsFn = createServerFn({ method: "GET" })
  .validator(GetUserWithMembershipsSchema)
  .handler(({ data }) => getUserWithMemberships(getRequestHeaders(), data))

export const updateCurrentUserFn = createServerFn({ method: "POST" })
  .validator(UpdateUserSchema)
  .handler(({ data }) => updateCurrentUser(getRequestHeaders(), data))
