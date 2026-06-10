import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { CreateSurveySchema, UpdateSurveySchema } from "@/src/shared/surveys/schemas"

const SurveyInputSchema = CreateSurveySchema.omit({ projectId: true })

export const GetSurveysSchema = ProjectSlugRequiredSchema
export const GetSurveySchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const CreateSurveyBySlugSchema = ProjectSlugRequiredSchema.extend(SurveyInputSchema.shape)
export const UpdateSurveyBySlugSchema = GetSurveySchema.extend(SurveyInputSchema.shape)
export const DeleteSurveySchema = GetSurveySchema

export const GetAdminSurveysSchema = z.object({})
export const GetAdminSurveySchema = z.object({ id: z.number() })
export const CreateAdminSurveySchema = CreateSurveySchema
export const UpdateAdminSurveySchema = UpdateSurveySchema
export const DeleteAdminSurveySchema = z.object({ id: z.number() })
