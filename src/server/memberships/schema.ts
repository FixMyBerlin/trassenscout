import { MembershipRoleEnum } from "@prisma/client"
import { z } from "zod"

export const MembershipSchema = z.object({
  projectId: z.coerce.number(),
  userId: z.coerce.number(),
  role: z.nativeEnum(MembershipRoleEnum),
})

/** Empty form state for AppField typing + `form.reset()`. */
export const membershipFormDefaultValues: z.infer<typeof MembershipSchema> = {
  userId: 0,
  role: MembershipRoleEnum.EDITOR,
  projectId: 0,
}

export const MembershipRoleFormSchema = z.object({
  role: z.nativeEnum(MembershipRoleEnum),
})

/** Empty form state for AppField typing + `form.reset()`. */
export const membershipRoleFormDefaultValues: z.infer<typeof MembershipRoleFormSchema> = {
  role: MembershipRoleEnum.VIEWER,
}
