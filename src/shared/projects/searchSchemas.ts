import { z } from "zod"

export const projectDashboardSearchSchema = z.object({
  operator: z.coerce.string().optional(),
})

export const adminProjectsSearchSchema = z.object({
  project: z.coerce.string().optional(),
})
