import { Prettify } from "@/src/core/types"
import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPolygonGeometrySchema,
  PointGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/core/utils/geojson-schemas"
import { InputNumberOrNullSchema, SlugSchema } from "@/src/core/utils/schema-shared"
import { LabelPositionEnum, LocationEnum, SubsubsectionTypeEnum } from "@prisma/client"
import { z } from "zod"
import type { SubsubsectionWithPosition } from "./queries/getSubsubsection"

// Type helper: infer geometry type from SubsubsectionTypeEnum
export type GeometryBySubsubsectionType<T extends SubsubsectionTypeEnum> = T extends "POINT"
  ? z.infer<typeof PointGeometrySchema>
  : T extends "LINE"
    ? z.infer<typeof LineStringGeometrySchema> | z.infer<typeof MultiLineStringGeometrySchema>
    : T extends "POLYGON"
      ? z.infer<typeof PolygonGeometrySchema> | z.infer<typeof MultiPolygonGeometrySchema>
      : never

/**
 * Validates a geometry object based on the subsubsection type.
 * Returns the same result as SubsubsectionGeometrySchema but only validates the geometry part.
 */
export const validateGeometryByType = (type: SubsubsectionTypeEnum, geometry: unknown) => {
  switch (type) {
    case "POINT":
      return PointGeometrySchema.safeParse(geometry)
    case "LINE":
      return LineStringGeometrySchema.or(MultiLineStringGeometrySchema).safeParse(geometry)
    case "POLYGON":
      return PolygonGeometrySchema.or(MultiPolygonGeometrySchema).safeParse(geometry)
    default:
      // Exhaustive check - TypeScript will error if a new enum value is added
      const _exhaustive: never = type
      return z.never().safeParse(geometry)
  }
}

export const NullableDateSchema = z.union([
  z.coerce
    .date({
      // `coerce` makes it that we need to work around a nontranslatable error
      // Thanks to https://github.com/colinhacks/zod/discussions/1851#discussioncomment-4649675
      errorMap: ({ code }, { defaultError }) => {
        if (code == "invalid_date") return { message: "Das Datum ist nicht richtig formatiert." }
        return { message: defaultError }
      },
    })
    .nullish(),
  z.literal(""),
])

export const NullableDateSchemaForm = z.union([
  z.string().min(8, { message: "Das Datum ist nicht richtig formatiert." }),
  z.literal(""),
])

// Base schema without refinement (for use with .omit())
export const SubsubsectionBaseSchema = z.object({
  slug: SlugSchema,
  subTitle: z.string().nullish(),
  type: z.nativeEnum(SubsubsectionTypeEnum),
  location: z.union([z.nativeEnum(LocationEnum), z.null()]),
  geometry: z.union([
    PointGeometrySchema,
    LineStringGeometrySchema,
    MultiLineStringGeometrySchema,
    PolygonGeometrySchema,
    MultiPolygonGeometrySchema,
  ]),
  labelPos: z.nativeEnum(LabelPositionEnum),
  lengthM: InputNumberOrNullSchema, // m
  width: InputNumberOrNullSchema, // m
  widthExisting: InputNumberOrNullSchema, // m
  costEstimate: InputNumberOrNullSchema, // €
  description: z.string().nullish(),
  mapillaryKey: z.string().nullish(),
  isExistingInfra: z.boolean(),
  qualityLevelId: InputNumberOrNullSchema,
  managerId: InputNumberOrNullSchema,
  subsectionId: z.coerce.number(),
  subsubsectionStatusId: InputNumberOrNullSchema,
  subsubsectionTaskId: InputNumberOrNullSchema,
  subsubsectionInfraId: InputNumberOrNullSchema,
  subsubsectionInfrastructureTypeId: InputNumberOrNullSchema,
  maxSpeed: InputNumberOrNullSchema,
  trafficLoad: InputNumberOrNullSchema,
  trafficLoadDate: NullableDateSchema,
  planningPeriod: InputNumberOrNullSchema,
  constructionPeriod: InputNumberOrNullSchema,
  estimatedCompletionDate: NullableDateSchema,
  estimatedConstructionDateString: z
    .string()
    .regex(/^(\d{4}|)$/, { message: "Datum im Format JJJJ" })
    .nullish(),
  planningCosts: InputNumberOrNullSchema,
  deliveryCosts: InputNumberOrNullSchema,
  constructionCosts: InputNumberOrNullSchema,
  landAcquisitionCosts: InputNumberOrNullSchema,
  expensesOfficialOrders: InputNumberOrNullSchema,
  expensesTechnicalVerification: InputNumberOrNullSchema,
  nonEligibleExpenses: InputNumberOrNullSchema,
  revenuesEconomicIncome: InputNumberOrNullSchema,
  contributionsThirdParties: InputNumberOrNullSchema,
  grantsOtherFunding: InputNumberOrNullSchema,
  ownFunds: InputNumberOrNullSchema,
  // LIST ALL m2mFields HERE
  // We need to do this manually, since dynamic zod types don't work
  specialFeatures: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

// Shared geometry type validation refinement function
export const geometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (data: any) => {
      // Validate that geometry type matches enum type
      if (data.type === "POINT" && data.geometry.type !== "Point") return false
      if (
        data.type === "LINE" &&
        data.geometry.type !== "LineString" &&
        data.geometry.type !== "MultiLineString"
      )
        return false
      if (
        data.type === "POLYGON" &&
        data.geometry.type !== "Polygon" &&
        data.geometry.type !== "MultiPolygon"
      )
        return false
      return true
    },
    {
      message:
        "Geometry type must match enum type (POINT→Point, LINE→LineString/MultiLineString, POLYGON→Polygon/MultiPolygon)",
    },
  )

// Refined schema with geometry type validation
export const SubsubsectionSchema = geometryTypeValidationRefine(SubsubsectionBaseSchema)

export type SubsubsectionWithPositionWithSpecialFeatures = Omit<
  SubsubsectionWithPosition,
  "manager" | "qualityLevel"
> & { specialFeatures: { id: number; title: string }[] }

export type TSubsubsectionSchema = Prettify<z.infer<typeof SubsubsectionSchema>>

export const SubsubsectionFormSchema = SubsubsectionBaseSchema.extend({
  trafficLoadDate: NullableDateSchemaForm,
  estimatedCompletionDate: NullableDateSchemaForm,
  location: z.union([z.nativeEnum(LocationEnum), z.literal("")]),
  // LIST ALL m2mFields HERE
  // We need to do this manually, since dynamic zod types don't work
  specialFeatures: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .transform((v) => v || []),
})
