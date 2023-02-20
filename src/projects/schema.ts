import { NameSchema, SlugSchema } from "src/core/utils"
import { z } from "zod"

export const ProjectSchema = z.object({
  slug: SlugSchema,
  title: NameSchema,
  shortTitle: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  description: z.string().nullish(),
  managerId: z.coerce.number(),
})
