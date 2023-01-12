import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { HeaderAppLogo } from "./HeaderAppLogo"
import { menuItems } from "./menuItems"

export const HeaderApp = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile logo={<HeaderAppLogo />} menuItems={menuItems} />
      <NavigationDesktop logo={<HeaderAppLogo />} menuItems={menuItems} />
    </NavigationWrapper>
  )
}
