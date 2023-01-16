import { Prisma } from "db"
import { z } from "zod"

// Thanks to https://github.com/chrishoermann/zod-prisma-types#field-validators
export const JsonValue: z.ZodType<Prisma.JsonValue> = z
  .union([
    z.string(),
    z.number(),
    z.boolean(),
    z.lazy(() => z.array(JsonValue)),
    z.lazy(() => z.record(JsonValue)),
  ])
  .nullable()

export const SubsectionSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  geometry: JsonValue,
  managerId: z.coerce.number(),
  sectionId: z.number(),
})

export type TSubsectionSchema = z.infer<typeof SubsectionSchema>
