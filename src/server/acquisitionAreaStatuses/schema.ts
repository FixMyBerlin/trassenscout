import { SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const AcquisitionAreaStatus = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  projectId: z.coerce.number(),
})

export type TAcquisitionAreaStatus = z.infer<typeof AcquisitionAreaStatus>
