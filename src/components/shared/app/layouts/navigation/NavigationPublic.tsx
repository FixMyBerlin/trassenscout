import { NavigationDesktop } from "./wrapper/NavigationDesktop"
import { NavigationMobile } from "./wrapper/NavigationMobile"
import { NavigationWrapper } from "./wrapper/NavigationWrapper"

/** Open routes (`_content`): session-aware user area — requires `optionalCurrentUserQueryOptions` primed in the route loader. */
export const NavigationPublic = () => {
  return (
    <NavigationWrapper>
      <NavigationMobile homeLink="/" homeLinkText="Startseite" userVariant="public" />
      <NavigationDesktop homeLink="/" homeLinkText="Startseite" userVariant="public" />
    </NavigationWrapper>
  )
}
