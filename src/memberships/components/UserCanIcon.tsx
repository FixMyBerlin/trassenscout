import { useQuery } from "@blitzjs/rpc"
import { EyeIcon, PencilIcon } from "@heroicons/react/20/solid"
import getCurrentUserWithMemberships from "src/users/queries/getCurrentUserWithMemberships"

type Props = { projectSlug: string; className?: string }

export const UserCanIcon = ({ projectSlug, className }: Props) => {
  const [user] = useQuery(getCurrentUserWithMemberships, null, { cacheTime: Infinity })
  if (!user) return null

  const userRoleOnProject = user.memberships.find((m) => m.project.slug === projectSlug)

  return (
    <>
      {userRoleOnProject?.role === "VIEWER" && (
        <EyeIcon title="Anzeige-Rechte" className={className || "h-4 w-4"} />
      )}
      {userRoleOnProject?.role === "EDITOR" && (
        <PencilIcon title="Editor-Rechte" className={className || "h-4 w-4"} />
      )}
    </>
  )
}
