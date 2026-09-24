import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"

/** Like requireMcpEnabledProject, but also throws unless the effective mode is DIRECT. */
export async function requireMcpDirectProject(projectSlug: string, now = new Date()) {
  const project = await requireMcpEnabledProject(projectSlug, now)
  if (project.mcpMode !== "DIRECT") {
    throw new Error(
      `Delete is only available while MCP direct write is active for "${projectSlug}". The effective mode is drafts.`,
    )
  }
  return project
}

export function assertMcpDirect(resolved: { mcpMode: string; projectSlug: string }) {
  if (resolved.mcpMode !== "DIRECT") {
    throw new Error(
      `Direct write refused: effective MCP mode for "${resolved.projectSlug}" is ${resolved.mcpMode}, not DIRECT.`,
    )
  }
}
