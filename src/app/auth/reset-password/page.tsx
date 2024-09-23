import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import { Metadata } from "next"
import "server-only"
import { TitleBodyWrapper } from "../_components/layouts/TitleBodyWrapper"
import { ResetForm } from "./_components/ResetForm"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Passwort vergessen",
}

export default async function ResetPasswordPage({ params }: { params: { token?: string } }) {
  const token = params?.token
  await useAuthenticatedBlitzContext({ redirectAuthenticatedTo: "/dashboard" })

  if (typeof token !== "string") {
    return (
      <TitleBodyWrapper title="Neues Passwort vergeben">
        <h2>Dieser Link ist ungültig.</h2>
      </TitleBodyWrapper>
    )
  }

  return (
    <TitleBodyWrapper title="Neues Passwort vergeben">
      <ResetForm token={token} />
    </TitleBodyWrapper>
  )
}
