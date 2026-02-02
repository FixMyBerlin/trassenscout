"use client"
import {
  blueButtonStylesForLinkElement,
  whiteButtonStylesForLinkElement,
} from "@/src/core/components/links"
import { Link } from "@/src/core/components/links/Link"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import { twMerge } from "tailwind-merge"
import { NavigationUserLoggedIn } from "./NavigationUserLoggedIn"

export const NavigationUser = () => {
  const user = useCurrentUser()

  return (
    <div className="sm:ml-6">
      {user ? (
        <NavigationUserLoggedIn user={user} />
      ) : (
        <div className="flex items-center gap-2">
          <Link
            button="white"
            // overwrites the default styles for the link element - not very neat
            // maybe we want twMerge in selectLinkStyles() and a small prop for button links in the future
            classNameOverwrites={twMerge(whiteButtonStylesForLinkElement, "px-3 py-2")}
            href={{
              pathname: "/auth/signup",
            }}
          >
            Registrieren
          </Link>
          <Link
            button="blue"
            classNameOverwrites={twMerge(blueButtonStylesForLinkElement, "px-3 py-2")}
            href="/auth/login"
          >
            Anmelden
          </Link>
        </div>
      )}
    </div>
  )
}
