import { Outlet } from "@tanstack/react-router"
import { ProjectModalHost } from "@/src/components/projectModals/ProjectModalHost"
import { NavigationLoggedInDashboard } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedInDashboard"
import { NavigationLoggedInProject } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedInProject"

function LoggedInMainShell({
  children,
  navigation,
}: {
  children: React.ReactNode
  navigation: React.ReactNode
}) {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-480 grow flex-col overflow-x-hidden">
      {navigation}
      <main className="w-full">{children}</main>
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
