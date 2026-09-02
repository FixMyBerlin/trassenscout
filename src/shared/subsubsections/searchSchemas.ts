import { z } from "zod"

export const subsubsectionEditSearchSchema = z.object({
  // JSON search: `?mcpDraft=true` parses as boolean; a quoted value parses as "true".
  mcpDraft: z.union([z.literal(true), z.literal("true")]).optional(),
})

export function isSubsubsectionMcpDraftSearch(mcpDraft: true | "true" | undefined) {
  return mcpDraft === true || mcpDraft === "true"
}
