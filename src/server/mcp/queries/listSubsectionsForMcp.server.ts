import db from "@/src/server/db.server"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { buildSubsectionUrl } from "@/src/server/mcp/subsectionUrl"

type ListSubsectionsForMcpInput = {
  projectSlug: string
  origin: string
  limit?: number
}

export async function listSubsectionsForMcp({
  projectSlug,
  origin,
  limit: limitInput,
}: ListSubsectionsForMcpInput) {
  const limit = resolveMcpListLimit(limitInput)
  const project = await requireMcpEnabledProject(projectSlug)

  const subsections = await db.subsection.findMany({
    where: { projectId: project.id },
    orderBy: { slug: "asc" },
    take: limit + 1,
    select: {
      slug: true,
      description: true,
    },
  })

  const { limit: appliedLimit, returned, truncated, items } = mcpListResult(subsections, limit)

  return {
    limit: appliedLimit,
    returned,
    truncated,
    subsections: items.map((subsection) => ({
      projectSlug: project.slug,
      slug: subsection.slug,
      description: subsection.description,
      url: buildSubsectionUrl(origin, project.slug, subsection.slug),
    })),
  }
}
