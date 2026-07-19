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
    <div className="relative flex h-full grow flex-col overflow-x-hidden">
      {navigation}
      <main className="mx-auto w-full max-w-7xl border-t border-gray-200 pb-16">{children}</main>
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
