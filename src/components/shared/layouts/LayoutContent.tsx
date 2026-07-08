import { Outlet } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { proseClasses } from "@/src/components/core/components/text/prose"
import { FooterGeneral } from "@/src/components/shared/app/layouts/footer/FooterGeneral"
import { NavigationPublic } from "@/src/components/shared/app/layouts/navigation/NavigationPublic"

export function LayoutContent() {
  return (
    <>
      {/* overflow-x-clip (not -hidden): hidden would create a scroll container and break the sticky table of contents */}
      <div className="relative flex h-full flex-col overflow-x-clip">
        <NavigationPublic />
        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">
          <div className={twJoin(proseClasses, "mx-auto mt-20 w-full")}>
            <Outlet />
          </div>
        </main>
      </div>
      <FooterGeneral />
    </>
  )
}
