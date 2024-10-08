import { FooterGeneral } from "@/src/app/_components/layouts/footer/FooterGeneral"
import { proseClasses } from "@/src/core/components/text/prose"
import { clsx } from "clsx"
import { NavigationLoggedOut } from "../_components/layouts/navigation/NavigationLoggedOut"

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <NavigationLoggedOut />
        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">
          <div className={clsx(proseClasses, "mx-auto mt-20 w-full")}>{children}</div>
        </main>
      </div>
      <FooterGeneral />
    </>
  )
}
