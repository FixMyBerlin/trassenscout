import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { NavigationGeneralLogo } from "./NavigationGeneralLogo"

export const NavigationGeneral = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile logo={<NavigationGeneralLogo />} menuItems={[]} />
      <NavigationDesktop logo={<NavigationGeneralLogo />} menuItems={[]} />
    </NavigationWrapper>
  )
}
