import { SlugSchema } from "@/src/core/utils/schema-shared"
import { StateKeyEnum } from "@prisma/client"
import { z } from "zod"

const ProjectSlugSchema = SlugSchema.max(15, { message: "Pflichtfeld. Maximal 15 Zeichen." })

export const ProjectSchema = z.object({
  slug: ProjectSlugSchema,
  subTitle: z.string().nullish(),
  description: z.string().nullish(),
  logoSrc: z.string().nullish(),
  partnerLogoSrcs: z.array(z.string()).nullish(),
  exportEnabled: z.coerce.boolean(),
  aiEnabled: z.coerce.boolean(),
  alkisStateKey: z.nativeEnum(StateKeyEnum),
  landAcquisitionModuleEnabled: z.coerce.boolean(),
})

export type ProjectType = z.infer<typeof ProjectSchema>

export const ProjectLogoScrcsInputSchema = z.object({
  partnerLogoSrcs: z.string().nullish(),
})

export const ProjectFormSchema = ProjectSchema.merge(ProjectLogoScrcsInputSchema)
export type ProjectFormType = z.infer<typeof ProjectFormSchema>

/** Empty form state for AppField typing + `form.reset()`. */
export const projectFormDefaultValues: ProjectFormType = {
  slug: "",
  subTitle: "",
  description: "",
  logoSrc: null,
  partnerLogoSrcs: null,
  exportEnabled: false,
  aiEnabled: false,
  alkisStateKey: StateKeyEnum.DISABLED,
  landAcquisitionModuleEnabled: false,
}
