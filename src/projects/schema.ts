import { NameSchema, SlugSchema } from "src/core/utils"
import { z } from "zod"

export const ProjectSchema = z.object({
  slug: SlugSchema,
  subTitle: z.string().nullish(),
  description: z.string().nullish(),
  logoSrc: z.string().nullish(),
  partnerLogoSrcs: z.string().array(),
  managerId: z.coerce.number().nullish(),
})

export const ProjectLogoScrcsInputSchema = z.object({
  partnerLogoSrcs: z.string().nullish(),
})
