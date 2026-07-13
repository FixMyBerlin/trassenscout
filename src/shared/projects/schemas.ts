import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"
import { StateKeyEnum } from "@/src/prisma/generated/browser"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

const ProjectSlugSchema = SlugSchema.max(15, { error: "Pflichtfeld. Maximal 15 Zeichen." })

export const ProjectSchema = z.object({
  slug: ProjectSlugSchema,
  subTitle: z.string().nullish(),
  description: z.string().nullish(),
  logoSrc: z.string().nullish(),
  partnerLogoSrcs: z.array(z.string()).nullish(),
  exportEnabled: z.coerce.boolean(),
  aiEnabled: z.coerce.boolean(),
  alkisStateKey: z.enum(StateKeyEnum),
  landAcquisitionModuleEnabled: z.coerce.boolean(),
})

const ProjectLogoSrcsInputSchema = z.object({
  partnerLogoSrcs: z.string().nullish(),
})

export const ProjectFormSchema = ProjectSchema.extend(ProjectLogoSrcsInputSchema.shape)

export const UpdateProjectSchema = ProjectSlugRequiredSchema.extend(ProjectSchema.shape)

export type ProjectFormType = z.infer<typeof ProjectFormSchema>

export const projectFormDefaultValues: ProjectFormType = {
  slug: "",
  subTitle: null,
  description: null,
  logoSrc: null,
  partnerLogoSrcs: "",
  exportEnabled: false,
  aiEnabled: false,
  alkisStateKey: StateKeyEnum.DISABLED,
  landAcquisitionModuleEnabled: false,
}
