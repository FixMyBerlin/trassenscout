import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useRouteContext } from "@tanstack/react-router"
import { editorRoles } from "@/src/server/authorization/constants"
import type { MembershipRole } from "@/src/server/authorization/types"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  children: React.ReactNode
}

function userCanEdit(
  role: string | undefined,
  membershipRole: MembershipRole | null | undefined,
  projectSlug: string,
  memberships: { project: { slug: string }; role: MembershipRole }[],
) {
  if (role === "ADMIN") return true
  if (membershipRole && editorRoles.includes(membershipRole)) return true
  return memberships.some(
    (membership) =>
      membership.project.slug === projectSlug && editorRoles.includes(membership.role),
  )
}

export const IfUserCanEdit = ({ children }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { membershipRole } = useRouteContext({ from: "/_loggedInProjects/$projectSlug" })
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  if (!userCanEdit(user.role, membershipRole, projectSlug, user.memberships ?? [])) {
    return null
  }

  return <>{children}</>
}
