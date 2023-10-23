import { LabelPositionEnum, SubsubsectionTypeEnum } from "@prisma/client"
import { Prettify } from "src/core/types"
import { SlugSchema } from "src/core/utils"
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
  length: z.coerce.number().nullish(), // km
  width: z.coerce.number().nullish(), // m
  costEstimate: z.coerce.number().nullish(), // €
  description: z.string().nullish(),
  mapillaryKey: z.string().nullish(),
  qualityLevelId: z.coerce.number().nullish(),
  managerId: z.coerce.number().nullish(),
  subsectionId: z.coerce.number(),
  maxSpeed: z.coerce.number().nullish(),
  trafficLoad: z.coerce.number().nullish(),
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
