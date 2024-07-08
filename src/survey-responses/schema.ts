import { SurveyResponseSourceEnum, SurveyResponseStatusEnum } from "@prisma/client"
import { z } from "zod"

export const SurveyResponseSchema = z.object({
  data: z.string(),
  status: z.nativeEnum(SurveyResponseStatusEnum),
  source: z.nativeEnum(SurveyResponseSourceEnum),
  surveySessionId: z.coerce.number(),
  surveyPart: z.coerce.number(),
  note: z.string().nullish(),
  operatorId: z.coerce.number().nullish(),
})

export const DeleteSurveyResponseSchema = z.object({ id: z.number() })
