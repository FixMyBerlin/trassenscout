import { menuItemsDesktop, menuItemsMobile } from "../HeaderRoute/menuItems"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { HeaderRouteLogo } from "./HeaderRouteLogo"

export const HeaderRoute = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile logo={<HeaderRouteLogo />} menuItems={menuItemsMobile} />
      <NavigationDesktop logo={<HeaderRouteLogo />} menuItems={menuItemsDesktop} />
    </NavigationWrapper>
  )
}
