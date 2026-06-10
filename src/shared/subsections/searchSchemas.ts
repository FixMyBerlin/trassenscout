import { z } from "zod"

export const subsectionAdminSearchSchema = z.object({
  updatedIds: z.string().optional(),
})
