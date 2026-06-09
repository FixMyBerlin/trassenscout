import { MultiPolygonGeometrySchema, PolygonGeometrySchema } from "@/src/core/utils/geojson-schemas"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const AcquisitionAreaGeometrySchema = z.union([
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
])
export type TAcquisitionAreaGeometrySchema = z.infer<typeof AcquisitionAreaGeometrySchema>

export const RequiredAcquisitionAreaGeometrySchema = z.custom<TAcquisitionAreaGeometrySchema>(
  (val) => AcquisitionAreaGeometrySchema.safeParse(val).success,
  { message: "Pflichtfeld. Bitte eine Geometrie zeichnen oder eingeben." },
)

export const AcquisitionAreaSchema = z.object({
  subsubsectionId: z.coerce.number(),
  parcelId: z.coerce.number(),
  geometry: RequiredAcquisitionAreaGeometrySchema,
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
