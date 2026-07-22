import { Outlet } from "@tanstack/react-router"
import { twMerge } from "tailwind-merge"
import { proseClasses } from "@/src/components/core/components/text/prose"
import { FooterGeneral } from "@/src/components/shared/app/layouts/footer/FooterGeneral"
import { NavigationPublic } from "@/src/components/shared/app/layouts/navigation/NavigationPublic"
import { appMainClassName, appShellClassName } from "@/src/components/shared/layouts/layoutClasses"

export function LayoutContent() {
  return (
    <div className={twMerge(appShellClassName, "overflow-x-clip")}>
      <NavigationPublic />
      <main className={`${appMainClassName} px-6 pb-16 md:px-8`}>
        <div className={`${proseClasses} mx-auto mt-20 w-full`}>
          <Outlet />
        </div>
      </main>
      <FooterGeneral />
    </div>
  )
}
