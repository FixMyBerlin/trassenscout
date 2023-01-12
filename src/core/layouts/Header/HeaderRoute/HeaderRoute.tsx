import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationWrapper } from "../NavigationWrapper"
import { HeaderRouteLogo } from "./HeaderRouteLogo"
import { primaryNavigation } from "./navigation.const"

export const HeaderRoute = () => {
  return (
    <NavigationWrapper>
      {/* <NavigationMobile
        logo={<HeaderRegionenLogo />}
        primaryNavigation={primaryNavigation}
        secondaryNavigation={secondaryNavigationGrouped}
      /> */}
      <NavigationDesktop
        logo={<HeaderRouteLogo />}
        primaryNavigation={primaryNavigation}
        //secondaryNavigation={secondaryNavigationGrouped}
      />
    </NavigationWrapper>
  )
}
