import { z } from "zod"

export const subsubsectionEditSearchSchema = z.object({
  // JSON search: `?mcpDraft=true` parses as boolean; a quoted value parses as "true".
  mcpDraft: z.union([z.literal(true), z.literal("true")]).optional(),
})

export const subsubsectionNewSearchSchema = subsubsectionEditSearchSchema.extend({
  slug: z.string().min(1).optional(),
})

export function isSubsubsectionMcpDraftSearch(mcpDraft: true | "true" | undefined) {
  return mcpDraft === true || mcpDraft === "true"
}

export const subsubsectionSearchtermSchema = z.coerce.string().optional().catch(undefined)

export const subsectionDashboardSearchSchema = z.object({
  searchterm: subsubsectionSearchtermSchema,
})
