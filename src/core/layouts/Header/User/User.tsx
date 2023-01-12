import { Routes } from "@blitzjs/next"
import { UserIcon } from "@heroicons/react/24/outline"
import React, { Suspense } from "react"
import { Link } from "src/core/components/links/Link"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { LoggedIn } from "./LoggedIn"

const UserWithQuery: React.FC = () => {
  const user = useCurrentUser()

  return (
    <div className="sm:ml-6">
      {!user ? (
        <Link
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white sm:border sm:border-gray-700"
          href={Routes.LoginPage()}
        >
          <span className="sr-only">Anmelden</span>
          <UserIcon className="h-6 w-6" aria-hidden="true" />
        </Link>
      ) : (
        <LoggedIn user={user} />
      )}
    </div>
  )
}

export const User: React.FC = () => {
  return (
    <Suspense>
      <UserWithQuery />
    </Suspense>
  )
}
