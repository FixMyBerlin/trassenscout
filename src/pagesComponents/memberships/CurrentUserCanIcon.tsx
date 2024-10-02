"use client"
import { useSession } from "@blitzjs/auth"
import { UserCanIcon } from "./UserCanIcon"

type Props = { projectSlug: string; className?: string }

export const CurrentUserCanIcon = ({ projectSlug, className }: Props) => {
  const session = useSession()
  const isAdmin = session.role === "ADMIN"

  if (isAdmin) {
    return <UserCanIcon role={"EDITOR"} isAdmin={isAdmin} className={className} />
  }

  if (!projectSlug) return null
  if (!session.memberships?.length) return null

  const userRoleOnProject = session.memberships.find((m) => m.project.slug === projectSlug)
  if (!userRoleOnProject) return null

  return <UserCanIcon role={userRoleOnProject!.role} isAdmin={isAdmin} className={className} />
}
