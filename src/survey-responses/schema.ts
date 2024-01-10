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

export const ExternalSurveyResponseFormSchema = z.object({
  source: z.nativeEnum(SurveyResponseSourceEnum),
  userText1: z.string().nonempty({ message: "Pflichtfeld." }),
  categoryId: z.string(),
  isLocation: z.string(),
})
