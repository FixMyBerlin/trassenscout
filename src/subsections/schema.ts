import { Prettify } from "src/core/types"
import { SlugSchema } from "src/core/utils"
import { z } from "zod"

export const SubsectionSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(3, {
    message: "Pflichtfeld. Mindestens 3 Zeichen.",
  }),
  description: z.string().nullish(),
  geometry: z.array(z.tuple([z.number(), z.number()])),
  managerId: z.coerce.number(),
  sectionId: z.coerce.number(),
})

export type TSubsectionSchema = Prettify<z.infer<typeof SubsectionSchema>>
