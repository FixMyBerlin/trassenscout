import { z } from "zod"

export const SurveyResponseTagSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().nullish(),
  projectId: z.coerce.number(),
})
