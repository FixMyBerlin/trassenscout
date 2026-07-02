import { z } from "zod"

export const SurveyResponseTopicSchema = z.object({
  title: z.string().trim().min(1),
  projectId: z.coerce.number(),
})
