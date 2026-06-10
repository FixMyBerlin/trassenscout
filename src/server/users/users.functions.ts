import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { UpdateUserSchema } from "@/src/shared/auth/schemas"
import { GetUsersAdminSchema, GetUsersWithMembershipsSchema } from "./users.inputSchemas"
import {
  getCurrentUser,
  getUsersAdmin,
  getUsersWithMemberships,
  updateCurrentUser,
} from "./users.server"
export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(() =>
  getCurrentUser(getRequestHeaders()),
)

export const getUsersAdminFn = createServerFn({ method: "GET" })
  .inputValidator(GetUsersAdminSchema)
  .handler(() => getUsersAdmin(getRequestHeaders()))

export const getUsersWithMembershipsFn = createServerFn({ method: "GET" })
  .inputValidator(GetUsersWithMembershipsSchema)
  .handler(() => getUsersWithMemberships(getRequestHeaders()))

export const updateCurrentUserFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateUserSchema)
  .handler(({ data }) => updateCurrentUser(getRequestHeaders(), data))
