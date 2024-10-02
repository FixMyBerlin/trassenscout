"use client"
import getProjects from "@/src/server/projects/queries/getProjects"
import { useQuery } from "@blitzjs/rpc"
import { usePathname } from "next/navigation"
import { ProjectsSwitch } from "./NavigationLoggedIn/ProjectsSwitch"
import { LinksDesktop } from "./NavigationLoggedInProject/LinksDesktop"
import { useMenuItems } from "./NavigationLoggedInProject/useMenuItems"
import { NavigationDesktop } from "./wrapper/NavigationDesktop"
import { NavigationMobile } from "./wrapper/NavigationMobile"
import { NavigationWrapper } from "./wrapper/NavigationWrapper"

export const NavigationLoggedInProject = () => {
  const [{ projects }] = useQuery(getProjects, {})
  const pathname = usePathname()
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
