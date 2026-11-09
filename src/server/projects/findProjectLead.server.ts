import { MembershipRoleEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import { authMessages, AuthorizationError } from "@/src/shared/auth/errors"

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

type ProjectLeadOrAdminInput = {
  projectId: number
  userId: number
  membershipRole: MembershipRoleEnum | null
}

export async function isProjectLeadOrAdmin({
  projectId,
  userId,
  membershipRole,
}: ProjectLeadOrAdminInput) {
  if (membershipRole === null) return true
  if (membershipRole !== MembershipRoleEnum.EDITOR) return false

  return (await findProjectLead(projectId))?.id === userId
}

export async function assertProjectLeadOrAdmin(input: ProjectLeadOrAdminInput) {
  if (!(await isProjectLeadOrAdmin(input))) {
    throw new AuthorizationError(authMessages.forbiddenAccess)
  }
}
