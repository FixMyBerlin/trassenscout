import { useSession } from "@blitzjs/auth"
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/20/solid"
import { roleTranslation } from "./roleTranslation.const"

type Props = { projectSlug: string; className?: string }

export const UserCanIcon = ({ projectSlug, className }: Props) => {
  const session = useSession()
  if (!session.memberships?.length) return null

  const userRoleOnProject = session.memberships.find((m) => m.project.slug === projectSlug)

  return (
    <>
      {userRoleOnProject?.role === "VIEWER" && (
        <LockClosedIcon
          title={roleTranslation[userRoleOnProject.role]}
          className={className || "h-4 w-4"}
        />
      )}
      {userRoleOnProject?.role === "EDITOR" && (
        <LockOpenIcon
          title={roleTranslation[userRoleOnProject.role]}
          className={className || "h-4 w-4"}
        />
      )}
    </>
  )
}
