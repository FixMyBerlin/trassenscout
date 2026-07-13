import { NavigationDesktop } from "./wrapper/NavigationDesktop"
import { NavigationMobile } from "./wrapper/NavigationMobile"
import { NavigationWrapper } from "./wrapper/NavigationWrapper"

export const NavigationLoggedOut = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile homeLink="/" homeLinkText="Startseite" userVariant="loggedOut" />
      <NavigationDesktop homeLink="/" homeLinkText="Startseite" userVariant="loggedOut" />
    </NavigationWrapper>
  )
}
