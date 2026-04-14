import { AcquisitionAreaGeometrySchema } from "@/src/server/acquisitionAreas/schema"
import { z } from "zod"

export const ParcelSchema = z.object({
  id: z.coerce.number().optional(),
  alkisParcelId: z.string(),
  alkisParcelIdSource: z.string(),
  geometry: AcquisitionAreaGeometrySchema.nullish(),
})

export type TParcelSchema = z.infer<typeof ParcelSchema>
