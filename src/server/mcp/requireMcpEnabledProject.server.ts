import db from "@/src/server/db.server"
import { effectiveMcpMode } from "@/src/server/mcp/effectiveMcpMode"

const mcpProjectSelect = {
  id: true,
  slug: true,
  mcpMode: true,
  mcpDirectUntil: true,
  subsubsectionExtraFieldDefinitions: true,
} as const

export async function requireMcpEnabledProject(projectSlug: string, now = new Date()) {
  const project = await db.project.findUnique({
    where: { slug: projectSlug },
    select: mcpProjectSelect,
  })
  if (!project) throw new Error(`Project not found: ${projectSlug}`)

  const mcpMode = effectiveMcpMode(project, now)
  if (mcpMode === "DISABLED") {
    throw new Error(
      `MCP is not enabled for project "${projectSlug}". An admin must enable it in /admin/projects (column MCP). Do not call other project tools for this slug until then.`,
    )
  }

  return { ...project, mcpMode, mcpDirectUntil: project.mcpDirectUntil }
}
