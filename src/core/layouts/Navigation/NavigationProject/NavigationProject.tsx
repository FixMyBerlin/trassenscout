import { menuItemsDesktop, menuItemsMobile } from "./menuItems"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { NavigationProjectLogo } from "./NavigationProjectLogo"
import { useParam } from "@blitzjs/next"
import { Suspense } from "react"
import getSections from "src/sections/queries/getSections"
import { useQuery } from "@blitzjs/rpc"
import getProject from "src/projects/queries/getProject"

const NavigationProjectWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ sections }] = useQuery(getSections, { where: { projectId: project.id! } })

  return (
    <NavigationWrapper>
      <NavigationMobile
        logo={<NavigationProjectLogo />}
        menuItems={menuItemsMobile(projectSlug, sections)}
      />
      <NavigationDesktop
        logo={<NavigationProjectLogo />}
        menuItems={menuItemsDesktop(projectSlug, sections)}
      />
    </NavigationWrapper>
  )
}

export const NavigationProject = () => {
  return (
    <Suspense>
      <NavigationProjectWithQuery />
    </Suspense>
  )
}
