"use client"
import { Route } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavigationGeneralLogo } from "../NavigationLoggedOut/TrassenscoutLogo"
import { NavigationUser } from "../NavigationUser/NavigationUser"

type Props = {
  homeLink: Route
  homeLinkText: string
  children?: React.ReactNode
}

export const NavigationDesktop = ({ homeLink, homeLinkText, children }: Props) => {
  const pathname = usePathname()

  return (
    <div className="relative hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex min-h-16 items-center justify-between gap-4 sm:h-16">
        <div className="flex flex-1 items-center justify-start sm:items-stretch">
          <div className="flex shrink-0 items-center justify-center">
            {pathname === homeLink ? (
              <NavigationGeneralLogo beta={false} />
            ) : (
              <Link href={homeLink}>
                <NavigationGeneralLogo beta={false} />
                <span className="sr-only">{homeLinkText}</span>
              </Link>
            )}
          </div>
        </div>

        {children}
      </div>
      <div className="flex items-center">
        <NavigationUser />
      </div>
    </div>
  )
}
