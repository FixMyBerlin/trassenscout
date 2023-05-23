import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"

export const NavigationGeneral = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile menuItems={[]} />
      <NavigationDesktop menuItems={[]} />
    </NavigationWrapper>
  )
}
