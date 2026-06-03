"use client"

import {
  blueButtonStylesForLinkElement,
  whiteButtonStylesForLinkElement,
} from "@/src/core/components/links"
import { Link } from "@/src/core/components/links/Link"
import { twMerge } from "tailwind-merge"

export const NavigationUserLoggedOut = () => {
  return (
    <div className="sm:ml-6">
      <div className="flex items-center gap-2">
        <Link
          button="white"
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
    </div>
  )
}
