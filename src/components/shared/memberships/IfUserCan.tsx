import { NoSymbolIcon } from "@heroicons/react/20/solid"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useRouteContext } from "@tanstack/react-router"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { isProduction } from "@/src/components/core/utils/isEnv"
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

const AdminHint = ({ children }: Props) => {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  if (isProduction) return children
  if (user.role !== "ADMIN") return children

  return (
    <>
      <Tooltip content="An dieser Stelle erscheint ein UI Element nur für Nutzer, die bestimmte Rechte haben.">
        <span className="m-1 inline-block rounded-sm border border-purple-300 bg-purple-100 p-1">
          <NoSymbolIcon className="size-4 text-purple-700" />
        </span>
      </Tooltip>
      {children}
    </>
  )
}

export const IfUserCanEdit = ({ children }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { membershipRole } = useRouteContext({ from: "/_loggedInProjects/$projectSlug" })
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  if (!userCanEdit(user.role, membershipRole, projectSlug, user.memberships ?? [])) {
    return null
  }

  return <AdminHint>{children}</AdminHint>
}
