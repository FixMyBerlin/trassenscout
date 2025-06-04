import { InputNumberOrNullSchema } from "@/src/core/utils"
import { z } from "zod"

const ProjectSlugSchema = z
  .string()
  .min(1, { message: "Pflichtfeld. Mindestens 1 Zeichen." })
  .max(15, { message: "Pflichtfeld. Maximal 15 Zeichen." })
  .regex(/^[a-z0-9-.]*$/, {
    message: "Pflichtfeld. Erlaubte Zeichen a-z, 0-9, - (Minus), . (Punkt)",
  })

export const ProjectSchema = z.object({
  slug: ProjectSlugSchema,
  subTitle: z.string().nullish(),
  description: z.string().nullish(),
  logoSrc: z.string().nullish(),
  partnerLogoSrcs: z.array(z.string()).nullish(),
  managerId: InputNumberOrNullSchema,
  exportEnabled: z.coerce.boolean(),
})

export type ProjectType = z.infer<typeof ProjectSchema>

export const ProjectLogoScrcsInputSchema = z.object({
  partnerLogoSrcs: z.string().nullish(),
})

export const ProjectFormSchema = ProjectSchema.merge(ProjectLogoScrcsInputSchema)
export type ProjectFormType = z.infer<typeof ProjectFormSchema>
