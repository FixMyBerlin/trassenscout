import { NameSchema, SlugSchema } from "src/core/utils"
import { z } from "zod"

export const ProjectSchema = z.object({
  slug: SlugSchema,
  name: NameSchema,
  shortName: z.string().nullish(),
  introduction: z.string().nullish(),
  managerId: z.coerce.number(),
})
