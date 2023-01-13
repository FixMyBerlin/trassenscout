import { menuItemsDesktop, menuItemsMobile } from "./menuItems"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { NavigationProjectLogo } from "./NavigationProjectLogo"

export const NavigationProject = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile logo={<NavigationProjectLogo />} menuItems={menuItemsMobile} />
      <NavigationDesktop logo={<NavigationProjectLogo />} menuItems={menuItemsDesktop} />
    </NavigationWrapper>
  )
}
