import { FooterGeneral } from "@/src/app/_components/layouts/footer/FooterGeneral"
import { NavigationLoggedOut } from "../_components/layouts/navigation/NavigationLoggedOut"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <NavigationLoggedOut />
        <main className="w-full">{children}</main>
      </div>
      <FooterGeneral />
    </>
  )
}
