import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { TagSchema } from "./schemas"

export const GetTagsSchema = ProjectSlugRequiredSchema.extend({
  includeArchived: z.boolean().optional(),
})

export const CreateTagSchema = ProjectSlugRequiredSchema.extend(
  TagSchema.omit({ projectId: true }).shape,
)

export const UpdateTagSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
  title: z.string().trim().min(1),
})

export const TagIdSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
})
