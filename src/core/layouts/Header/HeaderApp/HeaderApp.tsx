import { NavigationDesktop } from '../NavigationDesktop'
import { NavigationWrapper } from '../NavigationWrapper'
import { HeaderAppLogo } from './HeaderAppLogo'
import {
  primaryNavigation
} from './navigation.const'

export const HeaderApp = () => {
  return (
    <NavigationWrapper>
      {/* <NavigationMobile
        logo={<HeaderAppLogo />}
        primaryNavigation={primaryNavigation}
        secondaryNavigation={secondaryNavigationGrouped}
      /> */}
      <NavigationDesktop
        logo={<HeaderAppLogo />}
        primaryNavigation={primaryNavigation}
        // secondaryNavigation={secondaryNavigationGrouped}
      />
    </NavigationWrapper>
  )
}
