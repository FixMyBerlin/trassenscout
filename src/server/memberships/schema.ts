import { MembershipRoleEnum } from "@prisma/client"
import { z } from "zod"

export const MembershipSchema = z.object({
  projectId: z.coerce.number(),
  userId: z.coerce.number(),
  role: z.nativeEnum(MembershipRoleEnum),
})
