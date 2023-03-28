import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import getSections from "src/sections/queries/getSections"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { menuItems } from "./menuItems"
import { NavigationProjectLogo } from "./NavigationProjectLogo"

const NavigationProjectWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [{ sections }] = useQuery(getSections, { where: { project: { slug: projectSlug! } } })

  return (
    <NavigationWrapper>
      <NavigationMobile
        logo={<NavigationProjectLogo />}
        menuItems={menuItems(projectSlug!, sections!)}
      />
      <NavigationDesktop
        logo={<NavigationProjectLogo />}
        menuItems={menuItems(projectSlug!, sections!)}
      />
    </NavigationWrapper>
  )
}

export const NavigationProject = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <NavigationProjectWithQuery />
    </Suspense>
  )
}
