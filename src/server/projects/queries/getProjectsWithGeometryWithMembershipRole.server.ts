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
      subsections: {
        select: {
          id: true,
          slug: true,
          geometry: true,
          type: true,
          labelPos: true,
          SubsectionStatus: { select: { style: true } },
        },
      },
      memberships: { select: { role: true }, where: { userId: Number(session.userId) } },
    },
  })

  return projectsWithGeometryWithMembershipRole.map((project) => ({
    ...project,
    subsections: project.subsections.map((subsection) => typeSubsectionGeometry(subsection)),
  }))
}
