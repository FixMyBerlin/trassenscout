import { SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const DealAreaStatus = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  projectId: z.coerce.number(),
})

export type TDealAreaStatus = z.infer<typeof DealAreaStatus>
