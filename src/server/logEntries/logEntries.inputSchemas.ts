import { z } from "zod"

export const GetProjectLogEntriesSchema = z.object({
  projectSlug: z.string(),
  projectId: z.number(),
  take: z.number().optional(),
})
