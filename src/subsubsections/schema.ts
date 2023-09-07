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
  order: z.coerce.number(),
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
})

export type TSubsubsectionSchema = Prettify<z.infer<typeof SubsubsectionSchema>>

export const SubsubsectionSchemaForm = SubsubsectionSchema.merge(
  z.object({
    order: z.string(),
  }),
)
