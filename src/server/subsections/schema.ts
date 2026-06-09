import { InputNumberOrNullSchema, SlugSchema } from "@/src/core/utils/schema-shared"
import { RequiredSupportedGeometrySchema } from "@/src/server/shared/utils/geometrySchemas"
import { geometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import { GeometryTypeEnum, LabelPositionEnum } from "@prisma/client"
import { z } from "zod"

/** Form-only fields not persisted by SubsectionBaseSchema (legacy UI). */
type SubsectionFormExtraFields = {
  start: string
  end: string
  priority: string
}

export const SubsectionBaseSchema = z.object({
  slug: SlugSchema,
  order: z.coerce.number(),
  type: z.nativeEnum(GeometryTypeEnum),
  lengthM: InputNumberOrNullSchema,
  description: z.string().nullish(),
  labelPos: z.nativeEnum(LabelPositionEnum),
  geometry: RequiredSupportedGeometrySchema,
  projectId: z.coerce.number(),
  managerId: InputNumberOrNullSchema,
  operatorId: InputNumberOrNullSchema,
  networkHierarchyId: InputNumberOrNullSchema,
  subsectionStatusId: InputNumberOrNullSchema,
  estimatedCompletionDateString: z
    .string()
    .regex(/^(\d{4}-\d{2}|)$/, { message: "Datum im Format JJJJ-MM" })
    .nullish(),
})

// Refined schema with geometry type validation
export const SubsectionSchema = geometryTypeValidationRefine(SubsectionBaseSchema)

/** Empty form state for AppField typing + `form.reset()`. */
export const subsectionFormDefaultValues: z.infer<typeof SubsectionBaseSchema> &
  SubsectionFormExtraFields = {
  slug: "",
  start: "",
  end: "",
  order: 0,
  type: GeometryTypeEnum.LINE,
  lengthM: null,
  description: null,
  labelPos: LabelPositionEnum.top,
  geometry: undefined as unknown as z.infer<typeof SubsectionBaseSchema>["geometry"],
  projectId: 0,
  managerId: null,
  operatorId: null,
  networkHierarchyId: null,
  subsectionStatusId: null,
  estimatedCompletionDateString: null,
  priority: "",
}

export const SubsectionsFormSchema = z.object({
  prefix: z.string().regex(/^[a-z0-9-.]*$/, {
    message: "Pflichtfeld. Erlaubte Zeichen a-z, 0-9, - (Minus), . (Punkt)",
  }),
  no: z.coerce.number(),
})

/** Empty form state for AppField typing + `form.reset()`. */
export const multipleNewSubsectionsFormDefaultValues: z.infer<typeof SubsectionsFormSchema> = {
  prefix: "",
  no: 1,
}
const PointSchema = z.tuple([z.number(), z.number()]) // [x, y]
const MultiPointSchema = z.array(PointSchema) // [[x1, y1], [x2, y2], ...]
const LineStringSchema = z.array(PointSchema) // [[x1, y1], [x2, y2], ...]
const MultiLineStringSchema = z.array(LineStringSchema) // [[[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]]
const PolygonSchema = z.array(LineStringSchema) // Outer ring and inner rings: [[[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]]
const MultiPolygonSchema = z.array(PolygonSchema) // Collection of polygons: [[[[x1, y1], [x2, y2]]], [[[x3, y3], [x4, y4]]]]

export const GeometrySchema = z.object({
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

export const FeatureSchema = z.object({
  type: z.literal("Feature"),
  properties: z.record(z.any()),
  geometry: GeometrySchema,
})

export const FeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(FeatureSchema),
})
