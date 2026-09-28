import { z } from "zod"

export const LogEntriesCursorSchema = z.object({
  createdAt: z.iso.datetime(),
  id: z.number().int().positive(),
})

export const GetLogEntriesSchema = z.object({
  projectSlug: z.string().optional(),
  months: z.number().int().positive().optional(),
  cursor: LogEntriesCursorSchema.optional(),
})
