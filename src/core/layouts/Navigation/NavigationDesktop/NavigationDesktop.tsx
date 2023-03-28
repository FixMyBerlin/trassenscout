import { MenuItem } from "../types"
import { NavigationUser } from "../NavigationUser"
import { NavigationDesktopLinks } from "./NavigationDesktopLinks"
import { NavigationProjectsSwitch } from "../NavigationProjectsSwitch"
import { useRouter } from "next/router"
import { Link } from "src/core/components/links"

type Props = {
  menuItems: MenuItem[]
  logo: React.ReactElement
}

export const NavigationDesktop: React.FC<Props> = ({ menuItems, logo }) => {
  const { asPath } = useRouter()

  return (
    <div className="relative hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex min-h-[4rem] items-center justify-between space-x-6 sm:h-16">
        <div className="flex flex-1 items-center justify-start sm:items-stretch">
          <div className="flex flex-shrink-0 items-center justify-center">
            {asPath === "/" ? (
              <>{logo}</>
            ) : (
              <Link href="/" classNameOverwrites="">
                {logo}
                <span className="sr-only">Homepage</span>
              </Link>
            )}
          </div>
        </div>
        <NavigationDesktopLinks menuItems={menuItems} />
      </div>
      <div className="flex items-center">
        <NavigationProjectsSwitch />
        <NavigationUser />
      </div>
    </div>
  )
}
