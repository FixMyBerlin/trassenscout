import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import { Metadata } from "next"
import "server-only"
import { TitleBodyWrapper } from "../_components/layouts/TitleBodyWrapper"
import { SignupForm } from "./_components/SignupForm"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Anmelden",
}

export default async function SignupPage() {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useAuthenticatedBlitzContext is not a hook despite the "use" prefix
  await useAuthenticatedBlitzContext({ redirectAuthenticatedTo: "/dashboard" })

  return (
    <TitleBodyWrapper
      title="Account registrieren"
      subtitle="Willkommen! Hier können Sie sich registrieren."
    >
      <SignupForm />
    </TitleBodyWrapper>
  )
}
