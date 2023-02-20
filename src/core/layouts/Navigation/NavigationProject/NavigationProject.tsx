import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import getProjectWithId from "src/projects/queries/getProjectWithId"
import getSections from "src/sections/queries/getSections"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { menuItemsProject } from "./menuItems"
import { NavigationProjectLogo } from "./NavigationProjectLogo"

const NavigationProjectWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProjectWithId, {
    slug: projectSlug!,
  })
  const [{ sections }] = useQuery(getSections, { where: { projectId: project.id! } })
  const user = useCurrentUser()

  const projects = user?.projects

  return (
    <NavigationWrapper>
      <NavigationMobile
        logo={<NavigationProjectLogo />}
        menuItemsProject={menuItemsProject(projectSlug!, sections!)}
      />
      <NavigationDesktop
        logo={<NavigationProjectLogo />}
        menuItemsProject={menuItemsProject(projectSlug!, sections!)}
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
