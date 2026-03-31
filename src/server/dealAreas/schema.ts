import { MultiPolygonGeometrySchema, PolygonGeometrySchema } from "@/src/core/utils/geojson-schemas"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const DealAreaGeometrySchema = z.union([PolygonGeometrySchema, MultiPolygonGeometrySchema])

export const DealAreaSchema = z.object({
  subsubsectionId: z.coerce.number(),
  parcelId: InputNumberOrNullSchema,
  geometry: DealAreaGeometrySchema,
  acquisitionComplexity: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullish(),
  description: z.string().nullish(),
})

export type TDealAreaSchema = z.infer<typeof DealAreaSchema>
