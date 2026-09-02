import db from "@/src/server/db.server"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"

type ListFuehrungenForMcpInput = {
  projectSlug: string
  subsectionSlug?: string
  origin: string
  limit?: number
}

function buildFuehrungUrl(
  origin: string,
  projectSlug: string,
  subsectionSlug: string,
  subsubsectionSlug: string,
) {
  return new URL(
    `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}`,
    origin,
  ).href
}

export async function listFuehrungenForMcp({
  projectSlug,
  subsectionSlug,
  origin,
  limit: limitInput,
}: ListFuehrungenForMcpInput) {
  const limit = resolveMcpListLimit(limitInput)
  const project = await db.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, slug: true },
  })
  if (!project) {
    throw new Error(`Project not found: ${projectSlug}`)
  }

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
