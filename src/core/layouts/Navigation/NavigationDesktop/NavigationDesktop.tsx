import { Link } from "@/src/core/components/links"
import { useSlugs } from "@/src/core/hooks"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { NavigationGeneralLogo } from "../NavigationGeneral/NavigationGeneralLogo"
import { NavigationProps } from "../NavigationProject/NavigationProject"
import { NavigationProjectsSwitch } from "../NavigationProjectsSwitch"
import { NavigationUser } from "../NavigationUser"
import { NavigationDesktopLinks } from "./NavigationDesktopLinks"

export const NavigationDesktop: React.FC<NavigationProps> = ({ menuItems, projects }) => {
  const { asPath } = useRouter()
  const { projectSlug } = useSlugs()

  return (
    <div className="relative hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex min-h-[4rem] items-center justify-between gap-4 sm:h-16">
        <div className="flex flex-1 items-center justify-start sm:items-stretch">
          <div className="flex flex-shrink-0 items-center justify-center">
            {asPath === `/${projectSlug}` ? (
              <NavigationGeneralLogo beta={false} />
            ) : (
              <Link
                href={Routes.ProjectDashboardPage({ projectSlug: projectSlug! })}
                classNameOverwrites=""
              >
                <NavigationGeneralLogo beta={false} />
                <span className="sr-only">Homepage</span>
              </Link>
            )}
          </div>
        </div>

        <NavigationProjectsSwitch projects={projects} />
        <NavigationDesktopLinks menuItems={menuItems} />
      </div>
      <div className="flex items-center">
        <NavigationUser />
      </div>
    </div>
  )
}
