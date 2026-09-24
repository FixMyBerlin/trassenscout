import type { McpModeEnum } from "@/src/prisma/generated/browser"

export const MCP_DIRECT_WINDOW_MS = 24 * 60 * 60 * 1000

export type StoredMcpMode = {
  mcpMode: McpModeEnum
  mcpDirectUntil: Date | null
}

/** Stored DIRECT is effective only while `mcpDirectUntil` is still in the future. */
export function effectiveMcpMode(project: StoredMcpMode, now: Date): McpModeEnum {
  if (project.mcpMode !== "DIRECT") return project.mcpMode
  if (project.mcpDirectUntil != null && now < project.mcpDirectUntil) return "DIRECT"
  return "DRAFT"
}

export function mcpDirectUntilFromNow(now: Date) {
  return new Date(now.getTime() + MCP_DIRECT_WINDOW_MS)
}
