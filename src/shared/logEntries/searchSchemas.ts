import { z } from "zod"

export const logEntriesSearchSchema = z.object({
  projectSlug: z.string().optional(),
  months: z.coerce.number().int().positive().optional(),
})
