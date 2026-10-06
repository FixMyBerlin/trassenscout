import { Outlet } from "@tanstack/react-router"
import { FooterGeneral } from "@/src/components/shared/app/layouts/footer/FooterGeneral"
import { NavigationGeneralLogo } from "@/src/components/shared/app/layouts/navigation/NavigationLoggedOut/TrassenscoutLogo"
import { NavigationWrapper } from "@/src/components/shared/app/layouts/navigation/wrapper/NavigationWrapper"
import { appMainClassName, appShellClassName } from "@/src/components/shared/layouts/layoutClasses"

/** External visitors get no app navigation, only the brand and the legal footer. */
export function LayoutExternalShare() {
  return (
    <div className={appShellClassName}>
      <NavigationWrapper>
        <div className="flex h-16 items-center px-2">
          <NavigationGeneralLogo beta={false} />
        </div>
      </NavigationWrapper>
      <main className={`${appMainClassName} pb-16`}>
        <Outlet />
      </main>
      <FooterGeneral />
    </div>
  )
}
