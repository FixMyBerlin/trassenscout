import { z } from "zod"
import { MembershipRoleEnum } from "@/src/prisma/generated/client"

export const MembershipSchema = z.object({
  projectId: z.coerce.number(),
  userId: z.coerce.number(),
  role: z.enum(MembershipRoleEnum),
})

export const membershipFormDefaultValues: z.infer<typeof MembershipSchema> = {
  userId: 0,
  projectId: 0,
  role: "EDITOR",
}

export const updateMembershipRoleFormDefaultValues = {
  role: "VIEWER" as const,
}
