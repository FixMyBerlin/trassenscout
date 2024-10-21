import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import type { Metadata } from "next"
import { FooterMinimal } from "../_components/layouts/footer/FooterMinimal"
import { NavigationLoggedInDashboard } from "../_components/layouts/navigation/NavigationLoggedInDashboard"

export const metadata: Metadata = {
  robots: "noindex",
  title: {
    default: "Trassenscout",
    template: "%s – trassenscout.de",
  },
}

export default async function LoggedInGeneralLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({ redirectTo: "/auth/login" })

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
