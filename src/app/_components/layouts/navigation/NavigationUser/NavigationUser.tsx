"use client"
import { Link } from "@/src/core/components/links/Link"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import { UserIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { NavigationUserLoggedIn } from "./NavigationUserLoggedIn"

export const NavigationUser = () => {
  const user = useCurrentUser()

  return (
    <div className="sm:ml-6">
      {user ? (
        <NavigationUserLoggedIn user={user} />
      ) : (
        <Link
          className={clsx(
            "flex rounded-full bg-gray-800 p-1 text-sm",
            "hover:bg-gray-700 focus:bg-gray-700",
          )}
          href="/auth/login"
        >
          <span className="sr-only">Anmelden</span>
          <UserIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
