import { MembershipRoleEnum } from "@prisma/client"
import { z } from "zod"

export const InviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(MembershipRoleEnum),
})
