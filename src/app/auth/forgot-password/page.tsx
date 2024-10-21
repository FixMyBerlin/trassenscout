import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import { Metadata } from "next"
import "server-only"
import { TitleBodyWrapper } from "../_components/layouts/TitleBodyWrapper"
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Passwort vergessen",
}

export default async function ForgotPasswordPage() {
  await useAuthenticatedBlitzContext({ redirectAuthenticatedTo: "/dashboard" })

  return (
    <TitleBodyWrapper
      title="Passwort vergessen"
      subtitle="Bitte geben Sie Ihre E-Mail-Adresse ein, damit wir Ihnen einen Link zum Zurücksetzen Ihres Passwort senden können."
    >
      <ForgotPasswordForm />
    </TitleBodyWrapper>
  )
}
