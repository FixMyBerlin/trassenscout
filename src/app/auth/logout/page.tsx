import { Spinner } from "@/src/core/components/Spinner"
import { Metadata } from "next"
import { TitleBodyWrapper } from "../_components/layouts/TitleBodyWrapper"
import { Logout } from "./_components/Logout"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Abmelden",
}

export default function LogoutRedirectPage() {
  return (
    <TitleBodyWrapper title="Abmelden" subtitle="Sie werden abgemeldet…">
      <Logout />
      <Spinner page />
    </TitleBodyWrapper>
  )
}
