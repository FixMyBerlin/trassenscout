import { z } from "zod"

export const TagSchema = z.object({
  title: z.string().trim().min(1),
  projectId: z.coerce.number(),
})
