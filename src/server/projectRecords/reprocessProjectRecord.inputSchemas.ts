import { z } from "zod"

export const ReprocessProjectRecordSchema = z.object({
  projectRecordId: z.number().int().positive(),
  projectSlug: z.string().min(1),
})
