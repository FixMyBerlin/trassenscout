import { z } from "zod"

export const CreateSurveySessionSchema = z.object({
  surveyId: z.number(),
})
