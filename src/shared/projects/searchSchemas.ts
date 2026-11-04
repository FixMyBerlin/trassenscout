import { z } from "zod"
import { subsubsectionSearchtermSchema } from "@/src/shared/subsubsections/searchSchemas"

export const projectDashboardSearchSchema = z.object({
  operator: z.coerce.string().optional(),
  searchterm: subsubsectionSearchtermSchema,
})

export const adminProjectsSearchSchema = z.object({
  project: z.coerce.string().optional(),
})
