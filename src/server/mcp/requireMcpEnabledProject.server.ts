import db from "@/src/server/db.server"

export async function requireMcpEnabledProject(projectSlug: string) {
  const project = await db.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, slug: true, mcpEnabled: true, subsubsectionExtraFieldDefinitions: true },
  })
  if (!project) throw new Error(`Project not found: ${projectSlug}`)
  if (!project.mcpEnabled) {
    throw new Error(
      `MCP is not enabled for project "${projectSlug}". An admin must enable it in /admin/projects (column MCP). Do not call other project tools for this slug until then.`,
    )
  }
  return project
}
