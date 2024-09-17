import { Prettify } from "@/src/core/types"
import { InputNumberOrNullSchema, SlugSchema } from "@/src/core/utils"
import { LabelPositionEnum } from "@prisma/client"
import { z } from "zod"

export const SubsectionSchema = z.object({
  slug: SlugSchema,
  order: z.coerce.number(),
  lengthKm: z.coerce.number({ invalid_type_error: "Pflichtfeld" }),
  description: z.string().nullish(),
  start: z.string().min(1),
  end: z.string().min(1),
  labelPos: z.nativeEnum(LabelPositionEnum),
  geometry: z.array(z.tuple([z.number(), z.number()])),
  projectId: z.coerce.number(),
  managerId: InputNumberOrNullSchema,
  operatorId: InputNumberOrNullSchema,
  networkHierarchyId: InputNumberOrNullSchema,
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

const GeometrySchema = z.object({
  type: z.union([
    z.literal("Point"),
    z.literal("MultiPoint"),
    z.literal("LineString"),
    z.literal("MultiLineString"),
    z.literal("Polygon"),
    z.literal("MultiPolygon"),
    z.literal("GeometryCollection"),
  ]),
  coordinates: z.array(z.any()),
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
