import { z } from "zod"

export const SurveyResponseTagSchema = z.object({
  title: z.string().trim().min(1),
  projectId: z.coerce.number(),
})
