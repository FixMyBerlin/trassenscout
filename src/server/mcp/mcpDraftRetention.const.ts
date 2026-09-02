export const MCP_DRAFT_RETENTION_DAYS = 14

export function getMcpDraftRetentionCutoffDate(now = new Date()) {
  const date = new Date(now)
  date.setDate(date.getDate() - MCP_DRAFT_RETENTION_DAYS)
  return date
}
