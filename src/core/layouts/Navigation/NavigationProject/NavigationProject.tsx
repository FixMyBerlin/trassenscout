import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import getSections from "src/sections/queries/getSections"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { menuItems } from "./menuItems"
import { ProjectLogo } from "./ProjectLogo"

export const NavigationProject = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <NavigationWrapper>
      <NavigationMobile menuItems={menuItems(projectSlug!)} />
      <NavigationDesktop menuItems={menuItems(projectSlug!)} />
    </NavigationWrapper>
  )
}
