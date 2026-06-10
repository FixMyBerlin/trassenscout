import { z } from "zod"

export const landAcquisitionSearchSchema = z.object({
  acquisitionAreaId: z.coerce.number().int().positive().optional().catch(undefined),
})
