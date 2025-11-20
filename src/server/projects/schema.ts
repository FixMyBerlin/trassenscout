import { InputNumberOrNullSchema, SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

const ProjectSlugSchema = SlugSchema.max(15, { message: "Pflichtfeld. Maximal 15 Zeichen." })

export const ProjectSchema = z.object({
  slug: ProjectSlugSchema,
  subTitle: z.string().nullish(),
  description: z.string().nullish(),
  logoSrc: z.string().nullish(),
  partnerLogoSrcs: z.array(z.string()).nullish(),
  managerId: InputNumberOrNullSchema,
  exportEnabled: z.coerce.boolean(),
  aiEnabled: z.coerce.boolean(),
})

export type ProjectType = z.infer<typeof ProjectSchema>

export const ProjectLogoScrcsInputSchema = z.object({
  partnerLogoSrcs: z.string().nullish(),
})

export const ProjectFormSchema = ProjectSchema.merge(ProjectLogoScrcsInputSchema)
export type ProjectFormType = z.infer<typeof ProjectFormSchema>
