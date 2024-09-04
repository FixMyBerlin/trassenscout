import { useQuery } from "@blitzjs/rpc"
import getCurrentUserWithMemberships from "../../users/queries/getCurrentUserWithMemberships"
import { useSlugs } from "../../core/hooks"

// for debugging - to check if the backend works properly
const USER_HAS_ROLE: null | boolean = null

const userHasRole = (user: any, projectSlug: string, roles: Array<"VIEWER" | "EDITOR">) => {
  if (USER_HAS_ROLE !== null) return USER_HAS_ROLE
  if (!user) return false
  if (user.role === "ADMIN") return true
  return !!user.memberships.find(
    (membership: any) => membership.project.slug === projectSlug && roles.includes(membership.role),
  )
}

export const useUserCan = () => {
  const [user] = useQuery(getCurrentUserWithMemberships, null, { cacheTime: Infinity })
  const { projectSlug } = useSlugs()
  return {
    view: userHasRole(user, projectSlug!, ["VIEWER", "EDITOR"]),
    edit: userHasRole(user, projectSlug!, ["EDITOR"]),
  }
}
