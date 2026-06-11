import { z } from "zod"
import { MembershipRoleEnum } from "@/src/prisma/generated/browser"

export const InviteSchema = z.object({
  email: z.email(),
  role: z.enum(MembershipRoleEnum),
})

export const inviteFormDefaultValues: z.infer<typeof InviteSchema> = {
  email: "",
  role: "VIEWER",
}
