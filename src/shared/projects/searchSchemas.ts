import { z } from "zod"

export const projectDashboardSearchSchema = z.object({
  operator: z.string().optional(),
})
