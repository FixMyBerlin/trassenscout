import { z } from "zod"

export const GetPublicSurveyBySlugSchema = z.object({
  slug: z.string(),
})
