import db from "@/src/server/db.server"
import { buildFuehrungUrl } from "@/src/server/mcp/fuehrungUrl"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"

type ListFuehrungenForMcpInput = {
  projectSlug: string
  subsectionSlug?: string
  origin: string
  limit?: number
}

export async function listFuehrungenForMcp({
  projectSlug,
  subsectionSlug,
  origin,
  limit: limitInput,
}: ListFuehrungenForMcpInput) {
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
    fuehrungen: items.map((subsubsection) => ({
      projectSlug: project.slug,
      subsectionSlug: subsubsection.subsection.slug,
      slug: subsubsection.slug,
      url: buildFuehrungUrl(
        origin,
        project.slug,
        subsubsection.subsection.slug,
        subsubsection.slug,
      ),
    })),
  }
}
