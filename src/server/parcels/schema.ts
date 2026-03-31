import { z } from "zod"

export const ParcelSchema = z.object({
  id: z.coerce.number().optional(),
})

export type TParcelSchema = z.infer<typeof ParcelSchema>
