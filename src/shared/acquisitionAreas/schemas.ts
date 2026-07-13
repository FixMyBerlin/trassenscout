import { z } from "zod"
import { InputNumberOrNullSchema } from "@/src/components/core/utils/schema-shared"
import { PolygonLikeGeometrySchema } from "@/src/shared/geometry/geojsonSchemas"

export const AcquisitionAreaGeometrySchema = PolygonLikeGeometrySchema
export type TAcquisitionAreaGeometrySchema = z.infer<typeof AcquisitionAreaGeometrySchema>

export const AcquisitionAreaSchema = z.object({
  subsubsectionId: z.coerce.number(),
  parcelId: z.coerce.number(),
  geometry: AcquisitionAreaGeometrySchema,
  bufferRadiusM: InputNumberOrNullSchema,
  acquisitionAreaStatusId: InputNumberOrNullSchema,
  description: z.string().nullish(),
})

export type TAcquisitionAreaSchema = z.infer<typeof AcquisitionAreaSchema>

export const AcquisitionAreaFormSchema = z.object({
  description: z.string().nullish(),
  bufferRadiusM: InputNumberOrNullSchema,
  acquisitionAreaStatusId: InputNumberOrNullSchema,
  geometry: AcquisitionAreaGeometrySchema,
  type: z.literal("POLYGON").optional(),
})

export type AcquisitionAreaFormValues = z.infer<typeof AcquisitionAreaFormSchema>

/** Empty form state for AppField typing + `form.reset()`. */
export const acquisitionAreaFormDefaultValues: Omit<AcquisitionAreaFormValues, "geometry"> & {
  geometry: TAcquisitionAreaGeometrySchema | null
} = {
  description: "",
  bufferRadiusM: null,
  acquisitionAreaStatusId: null,
  geometry: null,
  type: "POLYGON",
}
