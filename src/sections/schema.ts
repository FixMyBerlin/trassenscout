import { z } from "zod"
import { LabelPositionEnum } from "@prisma/client"

import { SlugSchema } from "src/core/utils"

export const SectionSchema = z.object({
  slug: SlugSchema,
  order: z.coerce.number(),
  description: z.string().nullish(),
  start: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  end: z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." }),
  labelPos: z.nativeEnum(LabelPositionEnum),
  managerId: z.coerce.number(),
})
