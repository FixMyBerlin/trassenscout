import { LoginForm } from "@/src/app/auth/login/_components/LoginForm"
import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import { Notice } from "@/src/core/components/Notice"
import { Metadata } from "next"
import "server-only"
import { TitleBodyWrapper } from "../_components/layouts/TitleBodyWrapper"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Anmelden",
}

export type LoginFormMessageKeys = "loginRequired"

type Props = { params: { messageKey?: LoginFormMessageKeys } }

export default async function LoginPage({ params: { messageKey } }: Props) {
  await useAuthenticatedBlitzContext({ redirectAuthenticatedTo: "/dashboard" })

  return (
    <TitleBodyWrapper
      title="In Account einloggen"
      subtitle="Willkommen zurück! Bitte melden Sie sich an."
    >
      {messageKey === "loginRequired" && (
        <Notice type="warn" title="Anmeldung erforderlich">
          Um die gewünschte Seite aufzurufen müssen Sie angemeldet sein.
        </Notice>
      )}
      <LoginForm />
    </TitleBodyWrapper>
  )
}
