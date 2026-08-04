import { useSuspenseQuery } from "@tanstack/react-query"
import { optionalCurrentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { NavigationMetaMenu } from "../NavigationMetaMenu"
import { NavigationUserLoggedIn } from "./NavigationUserLoggedIn"
import { NavigationUserLoggedOut } from "./NavigationUserLoggedOut"

/** Public pages (e.g. `_content`): user menu when logged in, auth buttons otherwise. */
export const NavigationUserPublic = () => {
  const { data: user } = useSuspenseQuery(optionalCurrentUserQueryOptions())

  if (!user) return <NavigationUserLoggedOut />

  return (
    <>
      <NavigationMetaMenu />
      <NavigationUserLoggedIn user={user} />
    </>
  )
}
