import { Routes } from "@blitzjs/next"
import { UserIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import React, { Suspense } from "react"
import { Link } from "src/core/components/links/Link"
import { Spinner } from "src/core/components/Spinner"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { NavigationUserLoggedIn } from "./NavigationUserLoggedIn"

const UserWithQuery: React.FC = () => {
  const user = useCurrentUser()

  return (
    <div className="sm:ml-6">
      {!user ? (
        <Link
          className={clsx(
            "border-transparent flex rounded-full border-2 bg-gray-800 p-1 text-sm",
            "hover:border-offset-gray-800 hover:border-2 hover:border-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-white/30"
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
    <Suspense fallback={<Spinner />}>
      <UserWithQuery />
    </Suspense>
  )
}
