import { DealAreaGeometrySchema } from "@/src/server/dealAreas/schema"
import { z } from "zod"

export const ParcelSchema = z.object({
  id: z.coerce.number().optional(),
  gmlId: z.string().nullish(),
  geometry: DealAreaGeometrySchema.nullish(),
})

export type TParcelSchema = z.infer<typeof ParcelSchema>
