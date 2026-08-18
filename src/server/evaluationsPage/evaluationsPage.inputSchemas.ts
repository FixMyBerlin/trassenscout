import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import {
  emptyEvaluationsPageConfig,
  EvaluationsPageConfigSchema,
} from "@/src/shared/evaluations/evaluationsPageConfig"

export const EvaluationsPageByProjectSlugSchema = ProjectSlugRequiredSchema

export const EvaluationsPageContentSchema = z.object({
  title: z.string().min(1, "Pflichtfeld"),
  config: EvaluationsPageConfigSchema,
})

export const evaluationsPageFormDefaultValues: z.infer<typeof EvaluationsPageContentSchema> = {
  title: "",
  config: emptyEvaluationsPageConfig(),
}

export const UpsertEvaluationsPageSchema = ProjectSlugRequiredSchema.extend(
  EvaluationsPageContentSchema.shape,
)
