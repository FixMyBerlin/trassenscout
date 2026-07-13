import { z } from "zod"
import { MembershipRoleEnum } from "@/src/prisma/generated/browser"

export const MembershipSchema = z.object({
  projectId: z.coerce.number(),
  userId: z.coerce.number(),
  role: z.enum(MembershipRoleEnum),
})

export const updateMembershipRoleFormDefaultValues = {
  role: "VIEWER" as const,
}

export const SaveUserMembershipsSchema = z.object({
  userId: z.number().int().positive(),
  projectRoles: z.array(
    z.object({
      projectId: z.number().int().positive(),
      role: z.enum(MembershipRoleEnum).nullable(),
    }),
  ),
})
