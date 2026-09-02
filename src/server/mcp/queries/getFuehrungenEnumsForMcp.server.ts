import { subsubsectionLocationLabelMap } from "@/src/components/core/utils/subsubsectionLocationLabelMap"
import { LocationEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"

function enumOptions<T extends Record<string, string>>(
  values: T,
  titles?: Partial<Record<keyof T, string>>,
) {
  return Object.values(values).map((slug) => ({
    slug,
    title: titles?.[slug as keyof T] ?? slug,
  }))
}

export async function getFuehrungenEnumsForMcp(projectSlug: string) {
  const project = await requireMcpEnabledProject(projectSlug)

  const [
    qualityLevels,
    subsubsectionStatuses,
    subsubsectionTasks,
    subsubsectionInfras,
    subsubsectionInfrastructureTypes,
  ] = await Promise.all([
    db.qualityLevel.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsubsectionStatus.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsubsectionTask.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsubsectionInfra.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsubsectionInfrastructureType.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
  ])

  return {
    projectSlug: project.slug,
    qualityLevels,
    subsubsectionStatuses,
    subsubsectionTasks,
    subsubsectionInfras,
    subsubsectionInfrastructureTypes,
    location: enumOptions(LocationEnum, subsubsectionLocationLabelMap),
  }
}
