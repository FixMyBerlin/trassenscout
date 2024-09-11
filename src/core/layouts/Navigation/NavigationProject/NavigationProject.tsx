import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { shortTitle } from "src/core/components/text"
import getProjects from "src/projects/queries/getProjects"
import { NavigationDesktop } from "../NavigationDesktop"
import { NavigationMobile } from "../NavigationMobile"
import { NavigationWrapper } from "../NavigationWrapper"
import { menuItems } from "./menuItems"

export type NavigationProps = {
  menuItems: ReturnType<typeof menuItems>
  projects: PromiseReturnType<typeof getProjects>["projects"] | undefined
}

export const NavigationProjectWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const projects = useQuery(getProjects, {})[0].projects

  const projectName = projects.length === 1 && projects[0] ? shortTitle(projects[0].slug) : null

  return (
    <NavigationWrapper>
      <NavigationMobile
        menuItems={menuItems({ projectSlug: projectSlug!, projectName })}
        projects={projects}
      />
      <NavigationDesktop
        menuItems={menuItems({ projectSlug: projectSlug!, projectName })}
        projects={projects}
      />
    </NavigationWrapper>
  )
}

export const NavigationProject = () => {
  return (
    <Suspense fallback={<Spinner size="5" />}>
      <NavigationProjectWithQuery />
    </Suspense>
  )
}
