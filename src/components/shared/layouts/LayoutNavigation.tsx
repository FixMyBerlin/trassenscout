import { Outlet } from "@tanstack/react-router"
import { ProjectModalHost } from "@/src/components/projectModals/ProjectModalHost"
import { NavigationLoggedInDashboard } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedInDashboard"
import { NavigationLoggedInProject } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedInProject"
import { appMainClassName, appShellClassName } from "@/src/components/shared/layouts/layoutClasses"

function LoggedInMainShell({
  children,
  navigation,
}: {
  children: React.ReactNode
  navigation: React.ReactNode
}) {
  return (
    <div className={appShellClassName}>
      {navigation}
      <main className={appMainClassName}>{children}</main>
    </div>
  )
}

export function LayoutLoggedInGeneral() {
  return (
    <LoggedInMainShell navigation={<NavigationLoggedInDashboard />}>
      <Outlet />
    </LoggedInMainShell>
  )
}

export function LayoutLoggedInProject() {
  return (
    <LoggedInMainShell navigation={<NavigationLoggedInProject />}>
      <Outlet />
      <ProjectModalHost />
    </LoggedInMainShell>
  )
}
