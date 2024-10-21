import { FooterProject } from "@/src/app/_components/layouts/footer/FooterProject"
import { NavigationLoggedInProject } from "@/src/app/_components/layouts/navigation/NavigationLoggedInProject"
import { NavigationLoggedOut } from "@/src/app/_components/layouts/navigation/NavigationLoggedOut"
import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import { Suspense } from "react"
import { FooterGeneral } from "../../app/_components/layouts/footer/FooterGeneral"
import { FooterMinimal } from "../../app/_components/layouts/footer/FooterMinimal"
import { TailwindResponsiveHelper } from "../../app/_components/TailwindResponsiveHelper/TailwindResponsiveHelper"
import { Spinner } from "../components/Spinner"

type Props = {
  navigation: "general" | "project" | "none"
  footer: "general" | "project" | "minimal"
  children?: React.ReactNode
  fullWidth?: boolean
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
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="relative flex h-full flex-col overflow-x-hidden">
        <Suspense fallback={<Spinner size="5" />}>
          {navigation === "general" && <NavigationLoggedOut />}
          {navigation === "project" && <NavigationLoggedInProject />}
        </Suspense>

        {fullWidth ? (
          <main className="w-full">{children}</main>
        ) : (
          <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
        )}
      </div>
      <Suspense fallback={<Spinner size="5" />}>
        {footer === "general" && <FooterGeneral />}
        {footer === "project" && <FooterProject />}
        {footer === "minimal" && <FooterMinimal />}
      </Suspense>
      <TailwindResponsiveHelper />
    </>
  )
}
