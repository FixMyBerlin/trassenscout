import { JsonValue, SlugSchema } from "src/core/utils"
import { z } from "zod"

export const SubsectionSchema = z.object({
  slug: SlugSchema,
  title: z.string(),
  description: z.string().nullish(),
  geometry: z.coerce.string().min(20, {
    message: "Pflichtfeld. Format muss ein LineString sein [[9.1943,48.8932],[9.2043,48.8933]].",
  }),
  managerId: z.coerce.number(),
  sectionId: z.coerce.number(),
})

export type TSubsectionSchema = z.infer<typeof SubsectionSchema>
