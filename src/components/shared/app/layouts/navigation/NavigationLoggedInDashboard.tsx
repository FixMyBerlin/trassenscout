import { useSuspenseQuery } from "@tanstack/react-query"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { NavigationActivityLink } from "./NavigationActivityLink"
import { NavigationBookmarksLink } from "./NavigationBookmarksLink"
import { ProjectsSwitch } from "./NavigationLoggedIn/ProjectsSwitch"
import { NavigationDesktop } from "./wrapper/NavigationDesktop"
import { NavigationMobile } from "./wrapper/NavigationMobile"
import { NavigationWrapper } from "./wrapper/NavigationWrapper"

export const NavigationLoggedInDashboard = () => {
  const { data: projects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())
  const actions = (
    <>
      <NavigationBookmarksLink />
      <NavigationActivityLink />
    </>
  )

  return (
    <NavigationWrapper>
      <NavigationMobile
        homeLink="/dashboard"
        homeLinkText="Meine Projete"
        projects={projects}
        actions={actions}
      />
      <NavigationDesktop homeLink="/dashboard" homeLinkText="Meine Projekte" actions={actions}>
        <ProjectsSwitch projects={projects} />
      </NavigationDesktop>
    </NavigationWrapper>
  )
}
