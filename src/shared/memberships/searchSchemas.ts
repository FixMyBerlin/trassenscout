import { z } from "zod"

export const membershipNewSearchSchema = z.object({
  userId: z.string().optional(),
})
