import { SlugSchema } from "src/core/utils"
import { z } from "zod"

export const SubsubsectionSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(3, {
    message: "Pflichtfeld. Mindestens 3 Zeichen.",
  }),
  description: z.string().nullish(),
  geometry: z.coerce.string().min(20, {
    message: "Pflichtfeld. Format muss ein LineString sein [[9.1943,48.8932],[9.2043,48.8933]].",
  }),
  guidance: z.string().min(3, {
    message: "Pflichtfeld. Mindestens 3 Zeichen.",
  }),
  task: z.string().min(3, {
    message: "Pflichtfeld. Mindestens 3 Zeichen.",
  }),
  length: z.coerce.number(),
  width: z.coerce.number(),
  subsectionId: z.coerce.number(),
})

export type TSubsubsectionSchema = z.infer<typeof SubsubsectionSchema>
