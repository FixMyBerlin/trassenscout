import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import getProject from "src/projects/queries/getProject"
import getSections from "src/sections/queries/getSections"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { menuItemsDesktop, menuItemsMobile } from "./menuItems"
import { NavigationProjectLogo } from "./NavigationProjectLogo"

const NavigationProjectWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, {
    slug: projectSlug!,
    select: { id: true },
  })
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
    <Suspense fallback={<Spinner />}>
      <NavigationProjectWithQuery />
    </Suspense>
  )
}
