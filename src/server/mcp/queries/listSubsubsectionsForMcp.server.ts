import db from "@/src/server/db.server"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { buildSubsubsectionUrl } from "@/src/server/mcp/subsubsectionUrl"

type ListSubsubsectionsForMcpInput = {
  projectSlug: string
  subsectionSlug?: string
  origin: string
  limit?: number
}

export async function listSubsubsectionsForMcp({
  projectSlug,
  subsectionSlug,
  origin,
  limit: limitInput,
}: ListSubsubsectionsForMcpInput) {
  const limit = resolveMcpListLimit(limitInput)
  const project = await requireMcpEnabledProject(projectSlug)

  const subsubsections = await db.subsubsection.findMany({
    where: {
      subsection: {
        projectId: project.id,
        ...(subsectionSlug ? { slug: subsectionSlug } : {}),
      },
    },
    orderBy: [{ subsection: { slug: "asc" } }, { slug: "asc" }],
    take: limit + 1,
    select: {
      slug: true,
      subsection: { select: { slug: true } },
    },
  })

  const { limit: appliedLimit, returned, truncated, items } = mcpListResult(subsubsections, limit)

  return {
    limit: appliedLimit,
    returned,
    truncated,
    subsubsections: items.map((subsubsection) => ({
      projectSlug: project.slug,
      subsectionSlug: subsubsection.subsection.slug,
      slug: subsubsection.slug,
      url: buildSubsubsectionUrl(
        origin,
        project.slug,
        subsubsection.subsection.slug,
        subsubsection.slug,
      ),
    })),
  }
}
