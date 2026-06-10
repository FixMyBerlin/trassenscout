import { z } from "zod"

export const SurveyResponseTopicSchema = z.object({
  title: z.string(),
  projectId: z.coerce.number(),
})
