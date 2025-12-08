import { Prettify } from "@/src/core/types"
import { InputNumberOrNullSchema, SlugSchema } from "@/src/core/utils/schema-shared"
import { SupportedGeometrySchema } from "@/src/server/shared/utils/geometrySchemas"
import { geometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import { GeometryTypeEnum, LabelPositionEnum, LocationEnum } from "@prisma/client"
import { z } from "zod"
import type { SubsubsectionWithPosition } from "./queries/getSubsubsection"

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
  type: z.nativeEnum(GeometryTypeEnum),
  location: z.union([z.nativeEnum(LocationEnum), z.null()]),
  geometry: SupportedGeometrySchema,
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
