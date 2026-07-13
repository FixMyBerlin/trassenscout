import { useQuery } from "@tanstack/react-query"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import type { MembershipRoleEnum } from "@/src/prisma/generated/browser"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import type { CurrentUser } from "@/src/server/users/types"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

const userHasRole = (
  user: CurrentUser | null | undefined,
  projectSlug: string | undefined,
  roles: MembershipRoleEnum[],
) => {
  if (!user) return false
  if (user.role === UserRoleEnum.ADMIN) return true
  if (!projectSlug) return false
  return user.memberships.some(
    (membership) => membership.project.slug === projectSlug && roles.includes(membership.role),
  )
}

export const useUserCan = () => {
  const { data: user } = useQuery(currentUserQueryOptions())
  const projectSlug = useTryRouteParam("projectSlug")

  return {
    view: userHasRole(user, projectSlug, viewerRoles),
    edit: userHasRole(user, projectSlug, editorRoles),
  }
}
