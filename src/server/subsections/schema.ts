import { InputNumberOrNullSchema, InputNumberSchema, SlugSchema } from "@/src/core/utils"
import { LabelPositionEnum } from "@prisma/client"
import { z } from "zod"

export const SubsectionSchema = z.object({
  slug: SlugSchema,
  order: z.coerce.number(),
  lengthKm: InputNumberSchema,
  description: z.string().nullish(),
  start: z.string().min(1),
  end: z.string().min(1),
  labelPos: z.nativeEnum(LabelPositionEnum),
  geometry: z.array(z.tuple([z.number(), z.number()])),
  projectId: z.coerce.number(),
  managerId: InputNumberOrNullSchema,
  operatorId: InputNumberOrNullSchema,
  networkHierarchyId: InputNumberOrNullSchema,
  subsubsectionStatusId: InputNumberOrNullSchema,
  estimatedCompletionDateString: z
    .string()
    .regex(/^\d{4}-\d{2}$/, { message: "Datum im Format JJJJ-MM" })
    .nullish(),
})

export const SubsectionsFormSchema = z.object({
  prefix: z.string().regex(/^[a-z0-9-.]*$/, {
    message: "Pflichtfeld. Erlaubte Zeichen a-z, 0-9, - (Minus), . (Punkt)",
  }),
  no: z.coerce.number(),
})
const PointSchema = z.tuple([z.number(), z.number()]) // [x, y]
const MultiPointSchema = z.array(PointSchema) // [[x1, y1], [x2, y2], ...]
const LineStringSchema = z.array(PointSchema) // [[x1, y1], [x2, y2], ...]
const MultiLineStringSchema = z.array(LineStringSchema) // [[[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]]
const PolygonSchema = z.array(LineStringSchema) // Outer ring and inner rings: [[[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]]
const MultiPolygonSchema = z.array(PolygonSchema) // Collection of polygons: [[[[x1, y1], [x2, y2]]], [[[x3, y3], [x4, y4]]]]

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
  coordinates: z.union([
    PointSchema,
    MultiPointSchema,
    LineStringSchema,
    MultiLineStringSchema,
    PolygonSchema,
    MultiPolygonSchema,
  ]),
})

const FeatureSchema = z.object({
  type: z.literal("Feature"),
  properties: z.record(z.any()),
  geometry: GeometrySchema,
})

export const FeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(FeatureSchema),
})
