import { LabelPositionEnum, SubsubsectionTypeEnum } from "@prisma/client"
import { Prettify } from "src/core/types"
import { SlugSchema, InputNumberOrNullSchema } from "src/core/utils"
import { z } from "zod"

const PositionSchema = z.tuple([z.number(), z.number()]) // Position
const PositionArraySchema = z.array(z.tuple([z.number(), z.number()])) // Position[]

// TODO Later: Did not get this working with `schema={SubsubsectionSchema.omit({ subsectionId: true })}` in new-subsubsection.tsx
// const SubsubsectionGeometrySchema = z.discriminatedUnion("type", [
//   z.object({ type: z.literal("ROUTE"), geometry: PositionArraySchema }), // Line
//   z.object({ type: z.literal("AREA"), geometry: PositionSchema }), // Point
// ])

export const SubsubsectionSchema = z.object({
  slug: SlugSchema,
  subTitle: z.string().nullish(),
  type: z.nativeEnum(SubsubsectionTypeEnum),
  geometry: PositionSchema.or(PositionArraySchema),
  labelPos: z.nativeEnum(LabelPositionEnum),
  task: z.string().min(3, {
    message: "Pflichtfeld. Mindestens 3 Zeichen.",
  }), // Maßnahmentyp
  length: InputNumberOrNullSchema, // km
  width: InputNumberOrNullSchema, // m
  costEstimate: InputNumberOrNullSchema, // €
  description: z.string().nullish(),
  mapillaryKey: z.string().nullish(),
  qualityLevelId: InputNumberOrNullSchema,
  managerId: InputNumberOrNullSchema,
  subsectionId: z.coerce.number(),
  subsubsectionStatusId: InputNumberOrNullSchema,
  maxSpeed: InputNumberOrNullSchema,
  trafficLoad: InputNumberOrNullSchema,
  trafficLoadDate: z.union([
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
  ]),
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
})
export type TSubsubsectionSchema = Prettify<z.infer<typeof SubsubsectionSchema>>

export const SubsubsectionTrafficLoadDateSchema = z.object({
  trafficLoadDate: z.union([
    z.string().min(8, { message: "Das Datum ist nicht richtig formatiert." }),
    z.literal(""),
  ]),
})
export const SubsubsectionFormSchema = SubsubsectionSchema.omit({ trafficLoadDate: true }).merge(
  SubsubsectionTrafficLoadDateSchema,
)
