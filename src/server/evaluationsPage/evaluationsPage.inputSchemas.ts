import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const GetEvaluationsPagesSchema = z.object({})

export const EvaluationsPageByProjectSlugSchema = ProjectSlugRequiredSchema

export const EvaluationsPageContentSchema = z.object({
  title: z.string().min(1, "Pflichtfeld"),
  markdown: z.string().min(1, "Pflichtfeld"),
})

export const UpsertEvaluationsPageSchema = ProjectSlugRequiredSchema.extend(
  EvaluationsPageContentSchema.shape,
)
