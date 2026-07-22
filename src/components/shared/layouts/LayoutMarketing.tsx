import { Outlet } from "@tanstack/react-router"
import { FooterGeneral } from "@/src/components/shared/app/layouts/footer/FooterGeneral"
import { NavigationLoggedOut } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedOut"
import { appMainClassName, appShellClassName } from "@/src/components/shared/layouts/layoutClasses"

export function LayoutMarketing() {
  return (
    <div className={appShellClassName}>
      <NavigationLoggedOut />
      <main className={appMainClassName}>
        <Outlet />
      </main>
      <FooterGeneral />
    </div>
  )
}
