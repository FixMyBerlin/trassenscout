import { useSuspenseQuery } from "@tanstack/react-query"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { ProjectsSwitch } from "./NavigationLoggedIn/ProjectsSwitch"
import { LinksDesktop } from "./NavigationLoggedInProject/LinksDesktop"
import { useMenuItems } from "./NavigationLoggedInProject/useMenuItems"
import { NavigationDesktop } from "./wrapper/NavigationDesktop"
import { NavigationMobile } from "./wrapper/NavigationMobile"
import { NavigationWrapper } from "./wrapper/NavigationWrapper"

export const NavigationLoggedInProject = () => {
  const { data: projects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())
  const menuItems = useMenuItems()

  return (
    <NavigationWrapper>
      <NavigationMobile
        homeLink="/dashboard"
        homeLinkText="Meine Projete"
        menuItems={menuItems}
        projects={projects}
      />
      <NavigationDesktop homeLink="/dashboard" homeLinkText="Meine Projekte">
        <ProjectsSwitch projects={projects} />
        <LinksDesktop menuItems={menuItems} />
      </NavigationDesktop>
    </NavigationWrapper>
  )
}
