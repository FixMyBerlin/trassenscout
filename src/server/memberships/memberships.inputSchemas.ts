import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { MembershipSchema } from "@/src/shared/memberships/schemas"

export const UpdateMembershipRoleSchema = z.object({
  membershipId: z.number().int().positive(),
  role: MembershipSchema.shape.role,
})

export const DeleteMembershipSchema = z.object({
  membershipId: z.number().int().positive(),
})

export const DeleteProjectMembershipSchema = ProjectSlugRequiredSchema.extend({
  membershipId: z.number().int().positive(),
})

export const UpdateProjectMembershipRoleSchema = ProjectSlugRequiredSchema.extend({
  membershipId: z.number().int().positive(),
  role: MembershipSchema.shape.role,
})

export const GetProjectUsersSchema = ProjectSlugRequiredSchema.extend({
  role: MembershipSchema.shape.role.optional(),
})
