import { Outlet } from "@tanstack/react-router"
import { FooterMinimal } from "@/src/components/shared/app/layouts/footer/FooterMinimal"
import { FooterProject } from "@/src/components/shared/app/layouts/footer/FooterProject"
import { NavigationLoggedInDashboard } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedInDashboard"
import { NavigationLoggedInProject } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedInProject"
import { ProjectUploadModalHostProvider } from "@/src/components/uploads/ProjectUploadModalHost"

function LoggedInMainShell({
  children,
  navigation,
  footer,
}: {
  children: React.ReactNode
  navigation: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <>
      <div className="relative flex h-full grow flex-col overflow-x-hidden">
        {navigation}
        <main className="mx-auto w-full max-w-7xl px-6 pt-6 pb-16 md:px-8">{children}</main>
      </div>
      {footer}
    </>
  )
}

export function LayoutLoggedInGeneral() {
  return (
    <LoggedInMainShell navigation={<NavigationLoggedInDashboard />} footer={<FooterMinimal />}>
      <Outlet />
    </LoggedInMainShell>
  )
}

export function LayoutLoggedInProject() {
  return (
    <LoggedInMainShell navigation={<NavigationLoggedInProject />} footer={<FooterProject />}>
      <ProjectUploadModalHostProvider>
        <Outlet />
      </ProjectUploadModalHostProvider>
    </LoggedInMainShell>
  )
}
