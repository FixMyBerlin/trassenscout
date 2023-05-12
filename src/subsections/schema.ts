import { z } from "zod"
import { LabelPositionEnum } from "@prisma/client"

import { Prettify } from "src/core/types"
import { SlugSchema } from "src/core/utils"

export const SubsectionSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(3, {
    message: "Pflichtfeld. Mindestens 3 Zeichen.",
  }),
  description: z.string().nullish(),
  start: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  end: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  labelPos: z.nativeEnum(LabelPositionEnum),
  geometry: z.array(z.tuple([z.number(), z.number()])),
  managerId: z.coerce.number(),
  sectionId: z.coerce.number(),
})

export type TSubsectionSchema = Prettify<z.infer<typeof SubsectionSchema>>
