import { useSuspenseQuery } from "@tanstack/react-query"
import { optionalCurrentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { NavigationUserLoggedIn } from "./NavigationUserLoggedIn"
import { NavigationUserLoggedOut } from "./NavigationUserLoggedOut"

/** Public pages (e.g. `_content`): user menu when logged in, auth buttons otherwise. */
export const NavigationUserPublic = () => {
  const { data: user } = useSuspenseQuery(optionalCurrentUserQueryOptions())

  if (!user) return <NavigationUserLoggedOut />

  return (
    <div className="sm:ml-6">
      <NavigationUserLoggedIn user={user} />
    </div>
  )
}
