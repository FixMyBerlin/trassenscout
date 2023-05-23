import { useParam } from "@blitzjs/next"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { menuItems } from "./menuItems"

export const NavigationProject = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <NavigationWrapper>
      <NavigationMobile menuItems={menuItems(projectSlug!)} />
      <NavigationDesktop menuItems={menuItems(projectSlug!)} />
    </NavigationWrapper>
  )
}
