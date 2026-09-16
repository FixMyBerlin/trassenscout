import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import {
  emptyEvaluationsPageConfig,
  EvaluationsPageConfigSchema,
} from "@/src/shared/evaluations/evaluationsPageConfig"

export const EvaluationsPageByProjectSlugSchema = ProjectSlugRequiredSchema

export const EvaluationsPageContentSchema = z.object({
  config: EvaluationsPageConfigSchema,
})

export const evaluationsPageFormDefaultValues: z.infer<typeof EvaluationsPageContentSchema> = {
  config: emptyEvaluationsPageConfig(),
}

export const UpsertEvaluationsPageSchema = ProjectSlugRequiredSchema.extend(
  EvaluationsPageContentSchema.shape,
)
