import { z } from "zod"

export const SurveyResponseSchema = z.object({
  data: z.string(),
  status: z.enum(["PENDING", "ASSIGNED", "DONE_FAQ", "DONE_PLANING", "IRRELEVANT"]),
  surveySessionId: z.coerce.number(),
  surveyId: z.coerce.number(),
  note: z.string().nullish(),
  operatorId: z.coerce.number().nullish(),
})
