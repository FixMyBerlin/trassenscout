import { Outlet } from "@tanstack/react-router"
import { twMerge } from "tailwind-merge"
import { FooterGeneral } from "@/src/components/shared/app/layouts/footer/FooterGeneral"
import { NavigationPublic } from "@/src/components/shared/app/layouts/navigation/NavigationPublic"
import { appMainClassName, appShellClassName } from "@/src/components/shared/layouts/layoutClasses"

export function LayoutContent() {
  return (
    <div className={twMerge(appShellClassName, "overflow-x-clip")}>
      <NavigationPublic />
      <main className={`${appMainClassName} pb-16`}>
        <Outlet />
      </main>
      <FooterGeneral />
    </div>
  )
}
