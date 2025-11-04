import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import { Metadata } from "next"
import "server-only"
import { TitleBodyWrapper } from "../_components/layouts/TitleBodyWrapper"
import { ResetForm } from "./_components/ResetForm"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Passwort vergessen",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams?.token
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useAuthenticatedBlitzContext is not a hook despite the "use" prefix
  await useAuthenticatedBlitzContext({ redirectAuthenticatedTo: "/dashboard" })

  if (typeof token !== "string" || !token) {
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
