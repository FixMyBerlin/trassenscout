import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: "noindex",
  title: {
    default: "Trassenscout",
    template: "%s – trassenscout.de",
  },
}

export default async function LoggedInFullscreenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useAuthenticatedBlitzContext is not a hook despite the "use" prefix
  await useAuthenticatedBlitzContext({ redirectTo: "/auth/login" })

  return <div className="h-dvh w-full overflow-hidden">{children}</div>
}
