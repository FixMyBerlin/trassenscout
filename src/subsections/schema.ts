import { JsonValue, SlugSchema } from "src/core/utils"
import { z } from "zod"

export const SubsectionSchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  description: z.string().nullish(),
  geometry: JsonValue,
  managerId: z.coerce.number(),
  sectionId: z.number(),
})

export type TSubsectionSchema = z.infer<typeof SubsectionSchema>
