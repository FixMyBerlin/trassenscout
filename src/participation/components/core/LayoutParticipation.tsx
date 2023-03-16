import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import { TailwindResponsiveHelper } from "src/core/layouts/TailwindResponsiveHelper/TailwindResponsiveHelper"
import { FooterParticipation } from "./FooterParticipation"

type Props = {
  fullWidth?: boolean
  children?: React.ReactNode
  navigation?: React.ReactNode
}

export const LayoutParticipation: BlitzLayout<Props> = ({
  fullWidth = false,
  children,
  navigation,
}) => {
  return (
    <>
      <Head>
        {/* Reminder: We cannot use this to set the <body class>. See index.css for our workaround. */}
        {/* /src/core/layouts/Navigation/assets/trassenscout-logo-bildmarke.svg */}
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
      </Head>
      {navigation}
      <div className="relative flex h-full flex-col overflow-x-hidden">
        {fullWidth ? (
          <main className="w-full">{children}</main>
        ) : (
          <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
        )}
      </div>

      <FooterParticipation />
      <TailwindResponsiveHelper />
    </>
  )
}
