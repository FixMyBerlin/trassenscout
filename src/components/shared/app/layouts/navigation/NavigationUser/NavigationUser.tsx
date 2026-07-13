import { useSuspenseQuery } from "@tanstack/react-query"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { NavigationUserLoggedIn } from "./NavigationUserLoggedIn"

/** Authenticated shell nav only — public pages use `NavigationUserLoggedOut`. */
export const NavigationUser = () => {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  if (!user) return null

  return (
    <div className="sm:ml-6">
      <NavigationUserLoggedIn user={user} />
    </div>
  )
}
