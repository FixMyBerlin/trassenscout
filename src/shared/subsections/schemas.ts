import { z } from "zod"
import { InputNumberOrNullSchema, SlugSchema } from "@/src/components/core/utils/schema-shared"
import { GeometryTypeEnum, LabelPositionEnum } from "@/src/prisma/generated/browser"
import { SupportedGeoJsonGeometrySchema } from "@/src/shared/geometry/geojsonSchemas"
import { subsectionGeometryTypeValidationRefine } from "@/src/shared/geometry/geometryTypeValidation"

export const SubsectionBaseSchema = z.object({
  slug: SlugSchema,
  order: z.coerce.number(),
  type: z.enum(GeometryTypeEnum),
  lengthM: InputNumberOrNullSchema,
  description: z.string().nullish(),
  labelPos: z.enum(LabelPositionEnum),
  geometry: SupportedGeoJsonGeometrySchema,
  projectId: z.coerce.number(),
  managerId: InputNumberOrNullSchema,
  operatorId: InputNumberOrNullSchema,
  networkHierarchyId: InputNumberOrNullSchema,
  subsectionStatusId: InputNumberOrNullSchema,
  estimatedCompletionDateString: z
    .string()
    .regex(/^(\d{4}-\d{2}|)$/, { error: "Datum im Format JJJJ-MM" })
    .nullish(),
})

// Refined schema with geometry type validation
export const SubsectionSchema = subsectionGeometryTypeValidationRefine(SubsectionBaseSchema)

/** Form-only fields not persisted by SubsectionBaseSchema (legacy UI). */
type SubsectionFormExtraFields = {
  start: string
  end: string
  priority: string
}

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
    error: "Pflichtfeld. Erlaubte Zeichen a-z, 0-9, - (Minus), . (Punkt)",
  }),
  no: z.coerce.number(),
})

export const subsectionsFormDefaultValues: z.infer<typeof SubsectionsFormSchema> = {
  prefix: "",
  no: 1,
}

export const FeatureSchema = z.object({
  type: z.literal("Feature"),
  properties: z.record(z.string(), z.any()),
  geometry: SupportedGeoJsonGeometrySchema,
})

export const FeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(FeatureSchema),
})
