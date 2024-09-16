import { useSession } from "@blitzjs/auth"
import { MembershipRoleEnum, UserRoleEnum } from "db"
import { editorRoles, viewerRoles } from "src/authorization/constants"
import { useSlugs } from "../../core/hooks"

const userHasRole = (
  sessionOrUser:
    | ReturnType<typeof useSession>
    | {
        // A skeleton User type
        role: UserRoleEnum
        memberships: { project: { slug: string }; role: MembershipRoleEnum }[]
      },
  projectSlug: string,
  roles: MembershipRoleEnum[],
) => {
  if (!sessionOrUser) return false
  if (sessionOrUser.role === "ADMIN") return true
  return sessionOrUser?.memberships?.some(
    (membership: any) => membership.project.slug === projectSlug && roles.includes(membership.role),
  )
}

export const useUserCan = () => {
  const session = useSession()
  const { projectSlug } = useSlugs()

  return {
    view: userHasRole(session, projectSlug!, viewerRoles),
    edit: userHasRole(session, projectSlug!, editorRoles),
  }
}
