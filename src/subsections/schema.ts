import { z } from "zod"
import { LabelPositionEnum } from "@prisma/client"

import { Prettify } from "src/core/types"
import { SlugSchema } from "src/core/utils"

export const SubsectionSchema = z.object({
  slug: SlugSchema,
  order: z.coerce.number(),
  description: z.string().nullish(),
  start: z.string().min(1),
  end: z.string().min(1),
  labelPos: z.nativeEnum(LabelPositionEnum),
  geometry: z.array(z.tuple([z.number(), z.number()])),
  projectId: z.coerce.number(),
  managerId: z.coerce.number().nullish(),
  operatorId: z.coerce.number().nullish(),
})

export const SubsectionsSchema = z.array(
  SubsectionSchema.omit({ managerId: true, operatorId: true, description: true }),
)

export type TSubsectionSchema = Prettify<z.infer<typeof SubsectionSchema>>
