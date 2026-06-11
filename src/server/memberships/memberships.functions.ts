import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { MembershipSchema, SaveUserMembershipsSchema } from "@/src/shared/memberships/schemas"
import {
  DeleteMembershipSchema,
  DeleteProjectMembershipSchema,
  GetProjectUsersSchema,
  UpdateMembershipRoleSchema,
  UpdateProjectMembershipRoleSchema,
} from "./memberships.inputSchemas"
import {
  createMembership,
  deleteMembership,
  deleteProjectMembership,
  getProjectUsers,
  updateMembershipRole,
  updateProjectMembershipRole,
  saveUserMemberships,
} from "./memberships.server"

export const createMembershipFn = createServerFn({ method: "POST" })
  .inputValidator(MembershipSchema)
  .handler(({ data }) => createMembership(getRequestHeaders(), data))

const _updateMembershipRoleFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateMembershipRoleSchema)
  .handler(({ data }) => updateMembershipRole(getRequestHeaders(), data))

const _deleteMembershipFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteMembershipSchema)
  .handler(({ data }) => deleteMembership(getRequestHeaders(), data))

export const getProjectUsersFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectUsersSchema)
  .handler(({ data }) => getProjectUsers(getRequestHeaders(), data))

export const deleteProjectMembershipFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteProjectMembershipSchema)
  .handler(({ data }) => deleteProjectMembership(getRequestHeaders(), data))

export const updateProjectMembershipRoleFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectMembershipRoleSchema)
  .handler(({ data }) => updateProjectMembershipRole(getRequestHeaders(), data))

export const saveUserMembershipsFn = createServerFn({ method: "POST" })
  .inputValidator(SaveUserMembershipsSchema)
  .handler(({ data }) => saveUserMemberships(getRequestHeaders(), data))
