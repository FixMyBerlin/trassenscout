import { MenuItem } from "../types"
import { NavigationUser } from "../NavigationUser"
import { NavigationDesktopLinks } from "./NavigationDesktopLinks"
import { NavigationProjectsSwitch } from "../NavigationProjectsSwitch"

type Props = {
  menuItemsProject: MenuItem[]
  logo: React.ReactElement
}

export const NavigationDesktop: React.FC<Props> = ({
  menuItemsProject,

  logo: Logo,
}) => {
  return (
    <div className="relative hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex min-h-[4rem] items-center justify-between space-x-6 sm:h-16">
        <div className="flex flex-1 items-center justify-start sm:items-stretch">
          <div className="flex flex-shrink-0 items-center">{Logo}</div>
        </div>
        <NavigationDesktopLinks menuItems={menuItemsProject} />
      </div>
      <div className="flex items-center">
        <NavigationProjectsSwitch />
        <NavigationUser />
      </div>
    </div>
  )
}
