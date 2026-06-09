import { MembershipRoleEnum } from "@prisma/client"
import { z } from "zod"

export const InviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(MembershipRoleEnum),
})

/** Empty form state for AppField typing + `form.reset()`. */
export const teamInviteFormDefaultValues: z.infer<typeof InviteSchema> = {
  email: "",
  role: MembershipRoleEnum.VIEWER,
}
