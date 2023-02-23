import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import { FooterProject } from "./Footer"
import { FooterGeneral } from "./Footer/FooterGeneral"
import { FooterMinimal } from "./Footer/FooterMinimal"
import { NavigationGeneral, NavigationProject } from "./Navigation"
import { TailwindResponsiveHelper } from "./TailwindResponsiveHelper/TailwindResponsiveHelper"

type Props = {
  navigation: "general" | "project" | "none"
  footer: "general" | "project" | "minimal"
  children?: React.ReactNode
}

export const Layout: BlitzLayout<Props> = ({
  navigation = "general",
  footer = "general",
  children,
}) => {
  return (
    <>
      <Head>
        {/* Reminder: We cannot use this to set the <body class>. See index.css for our workaround. */}
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <div className="text-dark-gray relative flex h-full flex-col overflow-x-hidden">
        {navigation === "general" && <NavigationGeneral />}
        {navigation === "project" && <NavigationProject />}

        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
      </div>
      {footer === "general" && <FooterGeneral />}
      {footer === "project" && <FooterProject />}
      {footer === "minimal" && <FooterMinimal />}
      <TailwindResponsiveHelper />
    </>
  )
}
