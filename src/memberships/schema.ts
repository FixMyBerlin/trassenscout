import { z } from "zod"

export const MembershipSchema = z.object({
  projectId: z.coerce.number(),
  userId: z.coerce.number(),
})
