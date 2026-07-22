import { getLabelPosition } from "@/src/components/core/components/Map/utils/getLabelPosition"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { typeSubsectionGeometry } from "@/src/server/subsections/utils/typeSubsectionGeometry"

export async function getProjectsWithGeometryWithMembershipRole(headers: Headers) {
  const session = await endpointAuth.session(headers)

  const projectsWithGeometryWithMembershipRole = await db.project.findMany({
    // Note: We don't have a "ADMIN" sees all here, because that would fill the Dashboard with a map of all projects
    where: { memberships: { some: { userId: Number(session.userId) } } },
    select: {
      id: true,
      slug: true,
      subTitle: true,
      showLogEntries: true,
      _count: { select: { subsections: true } },
      subsections: {
        orderBy: { order: "asc" },
        take: 1,
        select: {
          geometry: true,
          labelPos: true,
          type: true,
        },
      },
      memberships: { select: { role: true }, where: { userId: Number(session.userId) } },
    },
  })

  return projectsWithGeometryWithMembershipRole.map((project) => {
    const firstSubsection = project.subsections[0]
    const previewPoint = firstSubsection
      ? getLabelPosition(typeSubsectionGeometry(firstSubsection).geometry, firstSubsection.labelPos)
      : null

    const { subsections: _subsections, _count, ...rest } = project

    return {
      ...rest,
      subsectionCount: _count.subsections,
      previewPoint,
    }
  })
}
