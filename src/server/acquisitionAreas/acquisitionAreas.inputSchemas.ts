import { z } from "zod"
import { InputNumberOrNullSchema } from "@/src/components/core/utils/schema-shared"
import {
  AcquisitionAreaGeometrySchema,
  AcquisitionAreaSchema,
} from "@/src/shared/acquisitionAreas/schemas"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const GetAcquisitionAreasSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionId: z.number().optional(),
})
export const GetAcquisitionAreaSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const CreateAcquisitionAreaSchema = ProjectSlugRequiredSchema.and(AcquisitionAreaSchema)
export const UpdateAcquisitionAreaSchema = GetAcquisitionAreaSchema.and(AcquisitionAreaSchema)
export const DeleteAcquisitionAreaSchema = GetAcquisitionAreaSchema
export const GetAcquisitionAreasBySubsubsectionSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionId: z.coerce.number(),
})
export const DeleteAllAcquisitionAreasForSubsubsectionSchema = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})
export const CreateAcquisitionAreasFromSelectionSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionId: z.coerce.number(),
  acquisitionAreas: z
    .array(
      z.object({
        alkisParcelId: z.string().trim().min(1),
        alkisParcelIdSource: z.string(),
        geometry: AcquisitionAreaGeometrySchema,
        parcelGeometry: AcquisitionAreaGeometrySchema,
        bufferRadiusM: InputNumberOrNullSchema,
        description: z.string().nullish(),
        acquisitionAreaStatusId: z.coerce.number().nullish(),
        mode: z.enum(["create", "update", "keep"]).default("create"),
      }),
    )
    .min(1),
})

export type GetAcquisitionAreasInput = z.infer<typeof GetAcquisitionAreasSchema>
