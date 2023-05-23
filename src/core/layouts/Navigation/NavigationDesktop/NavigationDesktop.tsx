import { useRouter } from "next/router"
import { Link } from "src/core/components/links"
import { menuItems } from "../NavigationProject/menuItems"
import { NavigationProjectsSwitch } from "../NavigationProjectsSwitch"
import { NavigationUser } from "../NavigationUser"
import { NavigationDesktopLinks } from "./NavigationDesktopLinks"
import { NavigationGeneralLogo } from "../NavigationGeneral/NavigationGeneralLogo"

type Props = {
  menuItems: ReturnType<typeof menuItems>
}

export const NavigationDesktop: React.FC<Props> = ({ menuItems }) => {
  const { asPath } = useRouter()

  return (
    <div className="relative hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex min-h-[4rem] items-center justify-between space-x-6 sm:h-16">
        <div className="flex flex-1 items-center justify-start sm:items-stretch">
          <div className="flex flex-shrink-0 items-center justify-center">
            {asPath === "/" ? (
              <NavigationGeneralLogo />
            ) : (
              <Link href="/" classNameOverwrites="">
                <NavigationGeneralLogo />
                <span className="sr-only">Homepage</span>
              </Link>
            )}
          </div>
        </div>

        <NavigationProjectsSwitch />
        <NavigationDesktopLinks menuItems={menuItems} />
      </div>
      <div className="flex items-center">
        <NavigationUser />
      </div>
    </div>
  )
}
