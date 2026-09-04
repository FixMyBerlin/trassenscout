import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const GetSubsubsectionMcpDraftSchema = ProjectSlugRequiredSchema.extend({
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})

export const DeleteMcpDraftSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionId: z.number().int().optional(),
  id: z.number().int().optional(),
}).refine((value) => value.subsubsectionId !== undefined || value.id !== undefined, {
  error: "subsubsectionId or id is required",
})

export const GetSubsectionMcpDraftSchema = ProjectSlugRequiredSchema.extend({
  slug: z.string(),
})

export const ListSubsectionMcpCreateDraftsSchema = ProjectSlugRequiredSchema.extend({
  subsectionSlug: z.string(),
})

export const ListProjectSubsectionMcpCreateDraftsSchema = ProjectSlugRequiredSchema
