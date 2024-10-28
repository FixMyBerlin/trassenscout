import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import type { Metadata } from "next"
import { FooterMinimal } from "../_components/layouts/footer/FooterMinimal"
import { NavigationLoggedInProject } from "../_components/layouts/navigation/NavigationLoggedInProject"

export const metadata: Metadata = {
  robots: "noindex",
  title: {
    default: "Trassenscout",
    template: "%s – trassenscout.de",
  },
}

export default async function LoggedInProjectsLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({ redirectTo: "/auth/login" })

  return (
    <>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <NavigationLoggedInProject />
        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
      </div>
      {/* <FooterProject /> <-- get nicht, da es auf pages directory helper zurück greift */}
      <FooterMinimal />
    </>
  )
}
