import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const GetMyBookmarkedSubsubsectionsSchema = z.object({
  projectSlug: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

export const GetSubsubsectionBookmarkSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionId: z.number().int().positive(),
})

export const SetSubsubsectionBookmarkSchema = GetSubsubsectionBookmarkSchema.extend({
  bookmarked: z.boolean(),
})
