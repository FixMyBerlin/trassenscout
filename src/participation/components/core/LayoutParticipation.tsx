import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import { TailwindResponsiveHelper } from "src/core/layouts/TailwindResponsiveHelper/TailwindResponsiveHelper"
import { FooterParticipation } from "./FooterParticipation"

type Props = {
  children?: React.ReactNode
  navigation?: React.ReactNode
}

export const LayoutParticipation: BlitzLayout<Props> = ({ children, navigation }) => {
  return (
    <>
      <Head>
        {/* TODO */}
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
      </Head>
      {navigation}
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <main className="mx-auto w-full max-w-3xl px-3 pb-40">{children}</main>
      </div>

      <FooterParticipation />
      <TailwindResponsiveHelper />
    </>
  )
}
