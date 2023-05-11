import { SlugSchema } from "src/core/utils"
import { z } from "zod"

export const SectionSchema = z.object({
  slug: SlugSchema,
  index: z.coerce.number(),
  title: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  subTitle: z.string().nullish(),
  description: z.string().nullish(),
  start: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  end: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  length: z.string().nullish(),
  managerId: z.coerce.number(),
})
