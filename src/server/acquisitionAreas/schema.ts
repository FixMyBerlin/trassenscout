import { MultiPolygonGeometrySchema, PolygonGeometrySchema } from "@/src/core/utils/geojson-schemas"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const AcquisitionAreaGeometrySchema = z.union([
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
])
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
