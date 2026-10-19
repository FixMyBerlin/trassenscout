import { z } from "zod"
import { TagColorEnum } from "@/src/prisma/generated/browser"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { TagSchema } from "./schemas"

export const GetTagsSchema = ProjectSlugRequiredSchema.extend({
  includeArchived: z.boolean().optional(),
})

// Admins only; omit to leave unchanged.
const adminTagFields = {
  description: z.string().trim().nullish(),
  color: z.enum(TagColorEnum).optional(),
}

export const CreateTagSchema = ProjectSlugRequiredSchema.extend({
  ...TagSchema.omit({ projectId: true }).shape,
  ...adminTagFields,
})

export const UpdateTagSchema = ProjectSlugRequiredSchema.extend({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  ...adminTagFields,
})

export const TagIdSchema = ProjectSlugRequiredSchema.extend({
  id: z.number().int().positive(),
})
