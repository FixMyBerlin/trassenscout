import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links/Link"
import { useCurrentUser } from "@/src/users/hooks/useCurrentUser"
import { Routes } from "@blitzjs/next"
import { UserIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import React, { Suspense } from "react"
import { NavigationUserLoggedIn } from "./NavigationUserLoggedIn"

const UserWithQuery: React.FC = () => {
  const user = useCurrentUser()

  return (
    <div className="sm:ml-6">
      {!user ? (
        <Link
          className={clsx(
            "flex rounded-full bg-gray-800 p-1 text-sm",
            "hover:bg-gray-700 focus:bg-gray-700",
          )}
          href={Routes.LoginPage()}
        >
          <span className="sr-only">Anmelden</span>
          <UserIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
        </Link>
      ) : (
        <NavigationUserLoggedIn user={user} />
      )}
    </div>
  )
}

export const NavigationUser: React.FC = () => {
  return (
    <Suspense fallback={<Spinner size="5" />}>
      <UserWithQuery />
    </Suspense>
  )
}
