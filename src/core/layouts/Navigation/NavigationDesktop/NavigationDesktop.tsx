import { MenuItems } from "../types"
import { User } from "../User"
import { NavigationDesktopLinks } from "./NavigationDesktopLinks"

type Props = MenuItems & {
  logo: React.ReactElement
}

export const NavigationDesktop: React.FC<Props> = ({ menuItems, logo: Logo }) => {
  return (
    <div className="relative hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex min-h-[4rem] items-center justify-between sm:h-16">
        <div className="flex flex-1 items-center justify-start sm:items-stretch">
          <div className="flex flex-shrink-0 items-center">{Logo}</div>
        </div>
      </div>
      <div className="flex items-center">
        <NavigationDesktopLinks menuItems={menuItems} />
        <User />
      </div>
    </div>
  )
}
