import { useSuspenseQuery } from "@tanstack/react-query"
import { Outlet } from "@tanstack/react-router"
import { twMerge } from "tailwind-merge"
import { FooterGeneral } from "@/src/components/shared/app/layouts/footer/FooterGeneral"
import { NavigationPublic } from "@/src/components/shared/app/layouts/navigation/NavigationPublic"
import { appMainClassName, appShellClassName } from "@/src/components/shared/layouts/layoutClasses"
import { optionalCurrentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export function LayoutContent() {
  const { data: user } = useSuspenseQuery(optionalCurrentUserQueryOptions())

  return (
    <div className={twMerge(appShellClassName, "overflow-x-clip")}>
      <NavigationPublic />
      <main className={`${appMainClassName} pb-16`}>
        <Outlet />
      </main>
      {!user && <FooterGeneral />}
    </div>
  )
}
