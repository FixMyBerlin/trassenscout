export function isMcpDraftSearch(mcpDraft: true | "true" | undefined) {
  return mcpDraft === true || mcpDraft === "true"
}
