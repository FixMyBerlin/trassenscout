import { useAuthenticatedBlitzContext } from "@/src/blitz-server"

// This layout only checks the logged in state.
// We need two two different sub-layouts for dashboard and regions because of the different navigation.
export default async function LoggedInLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({ redirectTo: "/auth/login" })

  return <>{children}</>
}
