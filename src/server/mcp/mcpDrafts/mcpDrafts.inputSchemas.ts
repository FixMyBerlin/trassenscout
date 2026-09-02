import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const GetSubsubsectionMcpDraftSchema = ProjectSlugRequiredSchema.extend({
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})

export const DeleteSubsubsectionMcpDraftSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionId: z.number().int(),
})
