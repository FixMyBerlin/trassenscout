import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import { FooterProject } from "./Footer"
import { FooterGeneral } from "./Footer/FooterGeneral"
import { FooterMinimal } from "./Footer/FooterMinimal"
import { FooterParticipation } from "./Footer/FooterParticipation"
import { NavigationGeneral, NavigationProject } from "./Navigation"
import { NavigationParticipation } from "./Navigation/NavigationParticipation/NavigationParticipation"
import { TailwindResponsiveHelper } from "./TailwindResponsiveHelper/TailwindResponsiveHelper"

type Props = {
  navigation: "general" | "project" | "none" | "participation"
  footer: "general" | "project" | "minimal" | "participation"
  fullWidth?: boolean
  children?: React.ReactNode
}

export const Layout: BlitzLayout<Props> = ({
  navigation = "general",
  footer = "general",
  fullWidth = false,
  children,
}) => {
  return (
    <>
      <Head>
        {/* Reminder: We cannot use this to set the <body class>. See index.css for our workaround. */}
        {/* /src/core/layouts/Navigation/assets/trassenscout-logo-bildmarke.svg */}
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="relative flex h-full flex-col overflow-x-hidden">
        {navigation === "general" && <NavigationGeneral />}
        {navigation === "project" && <NavigationProject />}
        {navigation === "participation" && <NavigationParticipation />}

        {fullWidth ? (
          <main className="w-full">{children}</main>
        ) : (
          <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
        )}
      </div>
      {footer === "general" && <FooterGeneral />}
      {footer === "project" && <FooterProject />}
      {footer === "minimal" && <FooterMinimal />}
      {footer === "participation" && <FooterParticipation />}
      <TailwindResponsiveHelper />
    </>
  )
}
