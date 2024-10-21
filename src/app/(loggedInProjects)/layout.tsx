import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: "noindex",
  title: {
    default: "Trassenscout",
    template: "%s – trassenscout.de",
  },
}

export default async function LoggedInProjectsLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({ redirectTo: "/auth/login" })

  return <>{children}</>
}
