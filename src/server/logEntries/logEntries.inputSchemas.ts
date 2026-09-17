import { z } from "zod"

export const GetLogEntriesSchema = z.object({
  projectSlug: z.string().optional(),
  months: z.number().int().positive().optional(),
  take: z.number().int().positive().max(200).optional(),
})
