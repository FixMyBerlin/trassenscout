import { Outlet } from "@tanstack/react-router"
import { clsx } from "clsx"
import { proseClasses } from "@/src/components/core/components/text/prose"
import { FooterGeneral } from "@/src/components/shared/app/layouts/footer/FooterGeneral"
import { NavigationLoggedOut } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedOut"

export function LayoutContent() {
  return (
    <>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <NavigationLoggedOut />
        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">
          <div className={clsx(proseClasses, "mx-auto mt-20 w-full")}>
            <Outlet />
          </div>
        </main>
      </div>
      <FooterGeneral />
    </>
  )
}
