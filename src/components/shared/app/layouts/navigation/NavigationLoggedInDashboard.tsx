import { useSuspenseQuery } from "@tanstack/react-query"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { ProjectsSwitch } from "./NavigationLoggedIn/ProjectsSwitch"
import { NavigationDesktop } from "./wrapper/NavigationDesktop"
import { NavigationMobile } from "./wrapper/NavigationMobile"
import { NavigationWrapper } from "./wrapper/NavigationWrapper"

export const NavigationLoggedInDashboard = () => {
  const { data: projects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())

  return (
    <NavigationWrapper>
      <NavigationMobile homeLink="/dashboard" homeLinkText="Meine Projete" projects={projects} />
      <NavigationDesktop homeLink="/dashboard" homeLinkText="Meine Projekte">
        <ProjectsSwitch projects={projects} />
      </NavigationDesktop>
    </NavigationWrapper>
  )
}
