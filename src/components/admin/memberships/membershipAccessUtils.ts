import { MembershipRoleEnum } from "@/src/prisma/generated/browser"

export type MembershipAccess = MembershipRoleEnum | null

/** Every access level selectable in the region toggle; exhaustive over {@link MembershipAccess}. */
export const MEMBERSHIP_ACCESS_LEVELS = [
  null,
  MembershipRoleEnum.VIEWER,
  MembershipRoleEnum.EDITOR,
] as const satisfies readonly MembershipAccess[]

export type MembershipAccessLevel = (typeof MEMBERSHIP_ACCESS_LEVELS)[number]

type MembershipLike = {
  role: MembershipRoleEnum
  project: { id: number }
}

export function getMembershipAccess(
  memberships: MembershipLike[],
  projectId: number,
): MembershipAccess {
  return memberships.find((membership) => membership.project.id === projectId)?.role ?? null
}

export function buildProjectRoles(
  projects: { id: number }[],
  accessByProjectId: Record<number, MembershipAccess>,
) {
  return projects.map((project) => ({
    projectId: project.id,
    role: accessByProjectId[project.id] ?? null,
  }))
}

export function buildAccessByProjectId(
  projects: { id: number }[],
  memberships: MembershipLike[],
): Record<number, MembershipAccess> {
  const access: Record<number, MembershipAccess> = {}
  for (const project of projects) {
    access[project.id] = getMembershipAccess(memberships, project.id)
  }
  return access
}

export function isMembershipAccessDirty(
  projects: { id: number }[],
  accessByProjectId: Record<number, MembershipAccess>,
  initialAccessByProjectId: Record<number, MembershipAccess>,
) {
  return projects.some(
    (project) =>
      (accessByProjectId[project.id] ?? null) !== (initialAccessByProjectId[project.id] ?? null),
  )
}
