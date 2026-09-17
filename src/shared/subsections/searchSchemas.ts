import { z } from "zod"

export const subsectionAdminSearchSchema = z.object({
  updatedIds: z.coerce.string().optional(),
})

export const subsectionEditSearchSchema = z.object({
  mcpDraft: z.union([z.literal(true), z.literal("true")]).optional(),
})

export const subsectionNewSearchSchema = subsectionEditSearchSchema.extend({
  slug: z.string().min(1).optional(),
})

export function isSubsectionMcpDraftSearch(mcpDraft: true | "true" | undefined) {
  return mcpDraft === true || mcpDraft === "true"
}
