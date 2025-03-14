import { Prettify } from "@/src/core/types"
import { InputNumberOrNullSchema, InputNumberSchema, SlugSchema } from "@/src/core/utils"
import { LabelPositionEnum, SubsubsectionTypeEnum } from "@prisma/client"
import { z } from "zod"
import { SubsubsectionWithPosition } from "./queries/getSubsubsection"

const PositionSchema = z.tuple([z.number(), z.number()]) // Position
const PositionArraySchema = z.array(z.tuple([z.number(), z.number()])) // Position[]

// TODO Later: Did not get this working with `schema={SubsubsectionSchema.omit({ subsectionId: true })}` in new-subsubsection.tsx
// const SubsubsectionGeometrySchema = z.discriminatedUnion("type", [
//   z.object({ type: z.literal("ROUTE"), geometry: PositionArraySchema }), // Line
//   z.object({ type: z.literal("AREA"), geometry: PositionSchema }), // Point
// ])

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

export const SubsubsectionSchema = z.object({
  slug: SlugSchema,
  subTitle: z.string().nullish(),
  type: z.nativeEnum(SubsubsectionTypeEnum),
  geometry: PositionSchema.or(PositionArraySchema),
  labelPos: z.nativeEnum(LabelPositionEnum),
  lengthKm: InputNumberSchema, // km
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

export type SubsubsectionWithPositionWithSpecialFeatures = Omit<
  SubsubsectionWithPosition,
  "manager" | "qualityLevel"
> & { specialFeatures: { id: number; title: string }[] }

export type TSubsubsectionSchema = Prettify<z.infer<typeof SubsubsectionSchema>>

export const SubsubsectionFormSchema = SubsubsectionSchema.omit({
  trafficLoadDate: true,
  estimatedCompletionDate: true,
  specialFeatures: true,
}).merge(
  z.object({
    trafficLoadDate: NullableDateSchemaForm,
    estimatedCompletionDate: NullableDateSchemaForm,
    // LIST ALL m2mFields HERE
    // We need to do this manually, since dynamic zod types don't work
    specialFeatures: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
  }),
)
