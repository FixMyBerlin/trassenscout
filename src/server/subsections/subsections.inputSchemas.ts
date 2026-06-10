import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { subsectionGeometryTypeValidationRefine } from "@/src/shared/geometry/geometryTypeValidation"
import { FeatureCollectionSchema, SubsectionBaseSchema } from "@/src/shared/subsections/schemas"

export const SubsectionInputSchema = SubsectionBaseSchema.omit({ projectId: true })

export const GetSubsectionsSchema = ProjectSlugRequiredSchema
export const GetSubsectionSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const GetSubsectionBySlugSchema = ProjectSlugRequiredSchema.extend({
  subsectionSlug: z.string(),
})
export const CreateSubsectionSchema = ProjectSlugRequiredSchema.extend(SubsectionInputSchema.shape)
export const UpdateSubsectionSchema = GetSubsectionSchema.extend(SubsectionInputSchema.shape)
export const DeleteSubsectionSchema = GetSubsectionSchema
export const CreateSubsectionsSchema = ProjectSlugRequiredSchema.extend({
  subsections: z.array(
    subsectionGeometryTypeValidationRefine(
      SubsectionBaseSchema.omit({
        managerId: true,
        operatorId: true,
        description: true,
        subsectionStatusId: true,
      }),
    ),
  ),
})
export const UpdateSubsectionsWithPlacemarkSchema = ProjectSlugRequiredSchema.extend({
  subsections: z.array(
    subsectionGeometryTypeValidationRefine(SubsectionBaseSchema.extend({ id: z.number() })),
  ),
  newGeometry: FeatureCollectionSchema,
})

export type GetSubsectionsInput = z.infer<typeof GetSubsectionsSchema>
export type CreateSubsectionsInput = z.infer<typeof CreateSubsectionsSchema>
