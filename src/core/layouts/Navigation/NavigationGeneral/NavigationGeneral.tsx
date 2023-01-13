import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { NavigationGeneralLogo } from "./NavigationGeneralLogo"
import { menuItems } from "./menuItems"

export const NavigationGeneral = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile logo={<NavigationGeneralLogo />} menuItems={menuItems} />
      <NavigationDesktop logo={<NavigationGeneralLogo />} menuItems={menuItems} />
    </NavigationWrapper>
  )
}
