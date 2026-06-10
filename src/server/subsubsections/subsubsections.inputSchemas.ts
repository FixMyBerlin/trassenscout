import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { SubsubsectionSchema } from "@/src/shared/subsubsections/schemas"

export const GetSubsubsectionsSchema = ProjectSlugRequiredSchema.extend({
  subsectionId: z.number().optional(),
})
export const GetSubsubsectionSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const GetSubsubsectionBySlugSchema = ProjectSlugRequiredSchema.extend({
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})
export const CreateSubsubsectionSchema = ProjectSlugRequiredSchema.and(SubsubsectionSchema)
export const UpdateSubsubsectionSchema = GetSubsubsectionSchema.and(SubsubsectionSchema)
export const DeleteSubsubsectionSchema = GetSubsubsectionSchema

export type GetSubsubsectionsInput = z.infer<typeof GetSubsubsectionsSchema>
export type CreateSubsubsectionInput = z.infer<typeof CreateSubsubsectionSchema>
