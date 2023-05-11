import { Prettify } from "src/core/types"
import { SlugSchema } from "src/core/utils"
import { z } from "zod"

export const SubsubsectionSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(3, {
    message: "Pflichtfeld. Mindestens 3 Zeichen.",
  }),
  description: z.string().nullish(),
  // TODO Enhance the types here to include the comming type: area|route with geometry:Position(AKA Point)|Position[](Line)
  geometry: z.array(z.tuple([z.number(), z.number()])),
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

export type TSubsubsectionSchema = Prettify<z.infer<typeof SubsubsectionSchema>>
