import { z } from "zod"
import { InputNumberOrNullSchema, SlugSchema } from "@/src/components/core/utils/schema-shared"
import { GeometryTypeEnum, LabelPositionEnum, LocationEnum } from "@/src/prisma/generated/browser"
import { SupportedGeometrySchema } from "@/src/shared/geometry/geometrySchemas"
import { geometryTypeValidationRefine } from "@/src/shared/geometry/geometryTypeValidation"

export const NullableDateSchema = z.union([
  z.coerce
    .date({
      error: (issue) =>
        issue.code === "invalid_type" ? "Das Datum ist nicht richtig formatiert." : undefined,
    })
    .nullish(),
  z.literal(""),
])

export const NullableDateSchemaForm = z.union([
  z.string().min(8, { error: "Das Datum ist nicht richtig formatiert." }),
  z.literal(""),
])

// Base schema without refinement (for use with .omit())
export const SubsubsectionBaseSchema = z.object({
  slug: SlugSchema,
  subTitle: z.string().nullish(),
  type: z.enum(GeometryTypeEnum),
  location: z.union([z.enum(LocationEnum), z.null()]),
  geometry: SupportedGeometrySchema,
  labelPos: z.enum(LabelPositionEnum),
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
  maxSpeed: InputNumberOrNullSchema,
  trafficLoad: InputNumberOrNullSchema,
  trafficLoadDate: NullableDateSchema,
  planningPeriod: InputNumberOrNullSchema,
  constructionPeriod: InputNumberOrNullSchema,
  estimatedCompletionDate: NullableDateSchema,
  estimatedConstructionDateString: z
    .string()
    .regex(/^(\d{4}|)$/, { error: "Datum im Format JJJJ" })
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
  subsubsectionInfrastructureTypeIds: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .optional(),
  specialFeatures: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

// Refined schema with geometry type validation
export const SubsubsectionSchema = geometryTypeValidationRefine(SubsubsectionBaseSchema)

/** Form-only overrides for fields that differ from persisted SubsubsectionBaseSchema. */
type SubsubsectionFormExtraFields = {
  location: LocationEnum | ""
  trafficLoadDate: string
  estimatedCompletionDate: string
  subsubsectionInfrastructureTypeIds: string[]
  specialFeatures: string[]
}

/** Empty form state for AppField typing + `form.reset()`. */
export const subsubsectionFormDefaultValues: Omit<
  z.infer<typeof SubsubsectionBaseSchema>,
  keyof SubsubsectionFormExtraFields
> &
  SubsubsectionFormExtraFields = {
  slug: "",
  subTitle: null,
  type: GeometryTypeEnum.LINE,
  location: "",
  geometry: undefined as unknown as z.infer<typeof SubsubsectionBaseSchema>["geometry"],
  labelPos: LabelPositionEnum.bottom,
  lengthM: null,
  width: null,
  widthExisting: null,
  costEstimate: null,
  description: null,
  mapillaryKey: null,
  isExistingInfra: false,
  qualityLevelId: null,
  managerId: null,
  subsectionId: 0,
  subsubsectionStatusId: null,
  subsubsectionTaskId: null,
  subsubsectionInfraId: null,
  maxSpeed: null,
  trafficLoad: null,
  trafficLoadDate: "",
  planningPeriod: null,
  constructionPeriod: null,
  estimatedCompletionDate: "",
  estimatedConstructionDateString: null,
  planningCosts: null,
  deliveryCosts: null,
  constructionCosts: null,
  landAcquisitionCosts: null,
  expensesOfficialOrders: null,
  expensesTechnicalVerification: null,
  nonEligibleExpenses: null,
  revenuesEconomicIncome: null,
  contributionsThirdParties: null,
  grantsOtherFunding: null,
  ownFunds: null,
  subsubsectionInfrastructureTypeIds: [],
  specialFeatures: [],
}

export const SubsubsectionFormSchema = SubsubsectionBaseSchema.extend({
  trafficLoadDate: NullableDateSchemaForm,
  estimatedCompletionDate: NullableDateSchemaForm,
  location: z.union([z.enum(LocationEnum), z.literal("")]),
  // LIST ALL m2mFields HERE
  // We need to do this manually, since dynamic zod types don't work
  subsubsectionInfrastructureTypeIds: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .transform((v) => (Array.isArray(v) ? v : [])),
  specialFeatures: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .transform((v) => v || []),
})
