import { z } from "zod"

export const SummarizeUploadSchema = z.object({
  uploadId: z.number().int().positive(),
  projectSlug: z.string().min(1),
})
