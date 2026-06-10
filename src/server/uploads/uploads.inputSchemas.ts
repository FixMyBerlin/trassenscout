import { z } from "zod"
import type { Prisma } from "@/src/prisma/generated/client"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { UploadSchema } from "@/src/shared/uploads/schemas"

export const GetUploadsSchema = ProjectSlugRequiredSchema
export const GetUploadsWithSubsectionsSchema = ProjectSlugRequiredSchema.extend({
  where: z.custom<Prisma.UploadWhereInput>().optional(),
  orderBy: z.custom<Prisma.UploadOrderByWithRelationInput>().optional(),
  skip: z.number().int().optional(),
  take: z.number().int().optional(),
})
export const GetUploadSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const CreateUploadSchema = ProjectSlugRequiredSchema.and(UploadSchema)
export const UpdateUploadSchema = GetUploadSchema.and(UploadSchema)
export const DeleteUploadSchema = GetUploadSchema
export const GetSurveyResponseUploadsSplitSchema = ProjectSlugRequiredSchema.extend({
  surveyResponseId: z.number(),
})

export const GetGeolocatedUploadsSchema = ProjectSlugRequiredSchema

const UploadIdSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const CopyToLuckyCloudSchema = UploadIdSchema
export const EndCollaborationSchema = UploadIdSchema

export const CreateSurveyUploadPublicSchema = z.object({
  surveyResponseId: z.number().int().positive(),
  surveySessionId: z.number().int().positive(),
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  externalUrl: z.url(),
  mimeType: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
})

export const GetUploadsMetaPublicSchema = z.object({
  surveyResponseId: z.number().int().positive(),
  surveySessionId: z.number().int().positive(),
  ids: z.array(z.number().int().positive()),
})

export const DeleteSurveyUploadPublicSchema = z.object({
  id: z.number().int().positive(),
  surveyResponseId: z.number().int().positive(),
  surveySessionId: z.number().int().positive(),
  deleteToken: z.string().min(1),
})

export type GetUploadsInput = z.infer<typeof GetUploadsSchema>
export type GetSurveyResponseUploadsSplitInput = z.infer<typeof GetSurveyResponseUploadsSplitSchema>
