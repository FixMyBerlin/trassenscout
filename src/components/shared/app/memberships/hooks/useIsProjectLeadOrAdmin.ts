import { useQuery } from "@tanstack/react-query"
import { MembershipRoleEnum, UserRoleEnum } from "@/src/prisma/generated/browser"
import type { CurrentUser } from "@/src/server/users/types"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

type LeadProject = { slug: string; projectLeadId: number | null }

// Same rule as the server: the Projektleitung only counts while they are an editor.
export const userIsProjectLeadOrAdmin = (
  user: CurrentUser | null | undefined,
  project: LeadProject | null | undefined,
) => {
  if (!user || !project) return false
  if (user.role === UserRoleEnum.ADMIN) return true
  return (
    project.projectLeadId === user.id &&
    user.memberships.some(
      (membership) =>
        membership.project.slug === project.slug && membership.role === MembershipRoleEnum.EDITOR,
    )
  )
}

export const useIsProjectLeadOrAdmin = (project: LeadProject | null | undefined) => {
  const { data: user } = useQuery(currentUserQueryOptions())
  return userIsProjectLeadOrAdmin(user, project)
}
