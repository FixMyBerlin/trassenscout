import { MembershipRoleEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"

// The Projektleitung only counts while they are an editor of the project.
export async function findProjectLead(projectId: number) {
  return db.user.findFirst({
    where: {
      projectsLed: { some: { id: projectId } },
      memberships: { some: { projectId, role: MembershipRoleEnum.EDITOR } },
    },
    select: { id: true, email: true },
  })
}
