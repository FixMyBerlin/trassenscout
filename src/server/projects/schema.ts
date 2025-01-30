import { InputNumberOrNullSchema, SlugSchema } from "@/src/core/utils"
import { z } from "zod"

export const ProjectSchema = z.object({
  slug: SlugSchema,
  subTitle: z.string().nullish(),
  description: z.string().nullish(),
  logoSrc: z.string().nullish(),
  partnerLogoSrcs: z.array(z.string()).nullish(),
  felt_subsection_geometry_source_url: z.union([z.string().url().nullish(), z.literal("")]),
  managerId: InputNumberOrNullSchema,
  exportEnabled: z.coerce.boolean(),
})

export type ProjectType = z.infer<typeof ProjectSchema>

export const ProjectLogoScrcsInputSchema = z.object({
  partnerLogoSrcs: z.string().nullish(),
})

export const ProjectFormSchema = ProjectSchema.merge(ProjectLogoScrcsInputSchema)
export type ProjectFormType = z.infer<typeof ProjectFormSchema>
