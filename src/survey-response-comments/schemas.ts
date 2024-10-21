import { z } from "zod"

export const CreateSurveyResponseCommentSchema = z.object({
  surveyResponseId: z.number(),
  body: z.string(),
})
