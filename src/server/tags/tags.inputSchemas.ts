import { z } from "zod"
import { TagColorEnum } from "@/src/prisma/generated/browser"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { TagSchema } from "./schemas"

export const GetTagsSchema = ProjectSlugRequiredSchema.extend({
  includeArchived: z.boolean().optional(),
})

export const CreateTagSchema = ProjectSlugRequiredSchema.extend(
  TagSchema.omit({ projectId: true }).shape,
)

export const UpdateTagSchema = ProjectSlugRequiredSchema.extend({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  // Admins only; omit to leave unchanged.
  description: z.string().trim().nullish(),
  color: z.enum(TagColorEnum).optional(),
})

export const TagIdSchema = ProjectSlugRequiredSchema.extend({
  id: z.number().int().positive(),
})
