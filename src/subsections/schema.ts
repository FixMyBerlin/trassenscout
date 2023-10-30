import { z } from "zod"
import { LabelPositionEnum } from "@prisma/client"

import { Prettify } from "src/core/types"
import { SlugSchema, inputNumberOrNullSchema } from "src/core/utils"

export const SubsectionSchema = z.object({
  slug: SlugSchema,
  order: z.coerce.number(),
  description: z.string().nullish(),
  start: z.string().min(1),
  end: z.string().min(1),
  labelPos: z.nativeEnum(LabelPositionEnum),
  geometry: z.array(z.tuple([z.number(), z.number()])),
  projectId: z.coerce.number(),
  managerId: inputNumberOrNullSchema,
  operatorId: inputNumberOrNullSchema,
})

export const SubsectionsSchema = z.array(
  SubsectionSchema.omit({ managerId: true, operatorId: true, description: true }),
)
export const SubsectionsFormSchema = z.object({
  prefix: z.string().regex(/^[a-z0-9-.]*$/, {
    message: "Pflichtfeld. Erlaubte Zeichen a-z, 0-9, - (Minus), . (Punkt)",
  }),
  no: z.coerce.number(),
})

export type TSubsectionSchema = Prettify<z.infer<typeof SubsectionSchema>>

const CoordinatesSchema = z.array(z.array(z.array(z.number()).min(2)))

const GeometrySchema = z.object({
  type: z.literal("MultiLineString"),
  coordinates: CoordinatesSchema,
})

const PropertiesSchema = z.record(z.any())

const FeatureSchema = z.object({
  geometry: GeometrySchema,
  properties: PropertiesSchema,
})

export const FeltApiResponseSchema = z.object({
  data: z.object({
    type: z.string(),
    metadata: z.record(z.any()),
    features: z.array(FeatureSchema),
  }),
  links: z.any(),
})
