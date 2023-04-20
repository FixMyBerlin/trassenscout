import { NameSchema, SlugSchema } from "src/core/utils"
import { z } from "zod"

export const ProjectSchema = z.object({
  slug: SlugSchema,
  title: NameSchema,
  shortTitle: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  description: z.string().nullish(),
  logoSrc: z.string().nullish(),
  managerId: z.coerce.number(),
  partnerLogoSrc: z.string().array(),
})
