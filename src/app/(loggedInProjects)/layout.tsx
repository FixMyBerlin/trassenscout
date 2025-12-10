import { FooterProject } from "@/src/app/_components/layouts/footer/FooterProject"
import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import type { Metadata } from "next"
import { NavigationLoggedInProject } from "../_components/layouts/navigation/NavigationLoggedInProject"

export const metadata: Metadata = {
  robots: "noindex",
  title: {
    default: "Trassenscout",
    template: "%s – trassenscout.de",
  },
}

export default async function LoggedInProjectsLayout({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useAuthenticatedBlitzContext is not a hook despite the "use" prefix
  await useAuthenticatedBlitzContext({ redirectTo: "/auth/login" })

  return (
    <>
      <div className="relative flex h-full grow flex-col overflow-x-hidden">
        <NavigationLoggedInProject />
        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
      </div>
      <FooterProject />
    </>
  )
}
