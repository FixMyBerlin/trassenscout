import { useLocation } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { NavigationGeneralLogo } from "../NavigationLoggedOut/TrassenscoutLogo"
import { NavigationUser } from "../NavigationUser/NavigationUser"
import { NavigationUserLoggedOut } from "../NavigationUser/NavigationUserLoggedOut"
import { NavigationUserPublic } from "../NavigationUser/NavigationUserPublic"
import type { NavigationUserVariant } from "../types"

type Props = {
  homeLink: string
  homeLinkText: string
  children?: React.ReactNode
  userVariant?: NavigationUserVariant
}

export const NavigationDesktop = ({
  homeLink,
  homeLinkText,
  children,
  userVariant = "auto",
}: Props) => {
  const pathname = useLocation().pathname

  return (
    <div className="relative hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex min-h-16 items-center justify-between gap-4 sm:h-16">
        <div className="flex flex-1 items-center justify-start sm:items-stretch">
          <div className="flex shrink-0 items-center justify-center">
            {pathname === homeLink ? (
              <NavigationGeneralLogo beta={false} />
            ) : (
              <Link to={homeLink}>
                <NavigationGeneralLogo beta={false} />
                <span className="sr-only">{homeLinkText}</span>
              </Link>
            )}
          </div>
        </div>

        {children}
      </div>
      <div className="flex items-center">
        {userVariant === "loggedOut" ? (
          <NavigationUserLoggedOut />
        ) : userVariant === "public" ? (
          <NavigationUserPublic />
        ) : (
          <NavigationUser />
        )}
      </div>
    </div>
  )
}
