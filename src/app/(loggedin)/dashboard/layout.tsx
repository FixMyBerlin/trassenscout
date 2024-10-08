import { FooterMinimal } from "../../_components/layouts/footer/FooterMinimal"
import { NavigationLoggedInDashboard } from "../../_components/layouts/navigation/NavigationLoggedInDashboard"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <NavigationLoggedInDashboard />
        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
      </div>
      <FooterMinimal />
    </>
  )
}
