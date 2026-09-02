import { shortTitle } from "@/src/components/core/components/text/titles"
import db from "@/src/server/db.server"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"

export async function listProjectsForMcp(origin: string, limitInput?: number) {
  const limit = resolveMcpListLimit(limitInput)
  const projects = await db.project.findMany({
    orderBy: { slug: "asc" },
    take: limit + 1,
    select: {
      id: true,
      slug: true,
      subTitle: true,
      _count: {
        select: {
          subsections: true,
        },
      },
    },
  })

  const { limit: appliedLimit, returned, truncated, items } = mcpListResult(projects, limit)

  const subsectionRows = await db.subsection.findMany({
    where: { projectId: { in: items.map((project) => project.id) } },
    select: {
      projectId: true,
      _count: { select: { subsubsections: true } },
    },
  })

  const fuehrungCountByProjectId = new Map<number, number>()
  for (const row of subsectionRows) {
    fuehrungCountByProjectId.set(
      row.projectId,
      (fuehrungCountByProjectId.get(row.projectId) ?? 0) + row._count.subsubsections,
    )
  }

  return {
    limit: appliedLimit,
    returned,
    truncated,
    projects: items.map((project) => ({
      slug: project.slug,
      subTitle: project.subTitle,
      shortTitle: shortTitle(project.slug),
      url: new URL(`/${project.slug}`, origin).href,
      paCount: project._count.subsections,
      fuehrungCount: fuehrungCountByProjectId.get(project.id) ?? 0,
    })),
  }
}
