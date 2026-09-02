import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { parseDefinitions } from "@/src/shared/subsubsections/extraFieldSchemas"

export async function getFuehrungenExtraFieldsForMcp(projectSlug: string) {
  const project = await requireMcpEnabledProject(projectSlug)
  const extraFields = parseDefinitions(project.subsubsectionExtraFieldDefinitions).map(
    (definition) => ({
      name: definition.name,
      label: definition.label,
      order: definition.order,
    }),
  )
  return { projectSlug: project.slug, extraFields }
}
