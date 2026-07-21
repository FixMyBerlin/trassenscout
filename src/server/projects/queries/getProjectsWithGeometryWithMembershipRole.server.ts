import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { typeSubsectionGeometry } from "@/src/server/subsections/utils/typeSubsectionGeometry"

export async function getProjectsWithGeometryWithMembershipRole(headers: Headers) {
  const session = await endpointAuth.session(headers)
  const userId = Number(session.userId)
  const isAdmin = session.role === UserRoleEnum.ADMIN

  const projectsWithGeometryWithMembershipRole = await db.project.findMany({
    where: isAdmin ? {} : { memberships: { some: { userId } } },
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
      memberships: { select: { role: true }, where: { userId } },
    },
  })

  return projectsWithGeometryWithMembershipRole.map((project) => ({
    ...project,
    subsections: project.subsections.map((subsection) => typeSubsectionGeometry(subsection)),
  }))
}
