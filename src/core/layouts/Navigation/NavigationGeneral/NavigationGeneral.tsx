import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { NavigationGeneralLogo } from "./NavigationGeneralLogo"
import { menuItems } from "./menuItems"
import { NavigationProjectLogo } from "../NavigationProject/NavigationProjectLogo"

export const NavigationGeneral = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile logo={<NavigationProjectLogo />} menuItemsProject={[]} />
      <NavigationDesktop logo={<NavigationProjectLogo />} menuItemsProject={[]} />
    </NavigationWrapper>
  )
}
