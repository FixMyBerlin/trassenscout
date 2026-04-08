import { MultiPolygonGeometrySchema, PolygonGeometrySchema } from "@/src/core/utils/geojson-schemas"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const DealAreaGeometrySchema = z.union([PolygonGeometrySchema, MultiPolygonGeometrySchema])
export type TDealAreaGeometrySchema = z.infer<typeof DealAreaGeometrySchema>

export const DealAreaSchema = z.object({
  subsubsectionId: z.coerce.number(),
  parcelId: z.coerce.number(),
  geometry: DealAreaGeometrySchema,
  dealAreaStatusId: InputNumberOrNullSchema,
  description: z.string().nullish(),
})

export type TDealAreaSchema = z.infer<typeof DealAreaSchema>
