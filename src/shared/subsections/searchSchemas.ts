import { z } from "zod"

export const subsectionAdminSearchSchema = z.object({
  updatedIds: z.coerce.string().optional(),
})
