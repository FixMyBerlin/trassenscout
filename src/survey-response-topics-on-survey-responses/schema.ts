import { z } from "zod"

export const SurveyResponseTopicsOnSurveyResponsesSchema = z.object({
  surveyResponseTopicId: z.coerce.number(),
  surveyResponseId: z.coerce.number(),
})
