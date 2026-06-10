import { Outlet } from "@tanstack/react-router"
import { FooterGeneral } from "@/src/components/shared/app/layouts/footer/FooterGeneral"
import { NavigationLoggedOut } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedOut"

export function LayoutMarketing() {
  return (
    <>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <NavigationLoggedOut />
        <main className="w-full">
          <Outlet />
        </main>
      </div>
      <FooterGeneral />
    </>
  )
}
