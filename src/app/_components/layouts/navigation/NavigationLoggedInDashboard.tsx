"use client"
import getProjects from "@/src/server/projects/queries/getProjects"
import { useQuery } from "@blitzjs/rpc"
import { ProjectsSwitch } from "./NavigationLoggedIn/ProjectsSwitch"
import { NavigationDesktop } from "./wrapper/NavigationDesktop"
import { NavigationMobile } from "./wrapper/NavigationMobile"
import { NavigationWrapper } from "./wrapper/NavigationWrapper"

export const NavigationLoggedInDashboard = () => {
  const [{ projects }] = useQuery(getProjects, {})

  return (
    <NavigationWrapper>
      <NavigationMobile homeLink="/dashboard" homeLinkText="Meine Projete" projects={projects} />
      <NavigationDesktop homeLink="/dashboard" homeLinkText="Meine Projekte">
        <ProjectsSwitch projects={projects} />
      </NavigationDesktop>
    </NavigationWrapper>
  )
}
