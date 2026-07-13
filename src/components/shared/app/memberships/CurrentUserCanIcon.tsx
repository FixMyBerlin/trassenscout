import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/src/components/shared/auth/auth-client"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { UserCanIcon } from "./UserCanIcon"

type Props = { projectSlug: string; className?: string }

export const CurrentUserCanIcon = ({ projectSlug, className }: Props) => {
  const { data: session } = authClient.useSession()
  const { data: user } = useQuery(currentUserQueryOptions())
  const isAdmin = session?.role === UserRoleEnum.ADMIN

  if (isAdmin) {
    return <UserCanIcon role="EDITOR" isAdmin={isAdmin} className={className} />
  }

  if (!projectSlug) return null
  if (!user?.memberships.length) return null

  const userRoleOnProject = user.memberships.find((m) => m.project.slug === projectSlug)
  if (!userRoleOnProject) return null

  return <UserCanIcon role={userRoleOnProject.role} isAdmin={false} className={className} />
}
