import { SlugSchema } from "src/core/utils"
import { z } from "zod"

export const SectionSchema = z.object({
  slug: SlugSchema,
  name: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  description: z.string().nullish(),
  managerId: z.coerce.number(),
  projectId: z.coerce.number(),
})
