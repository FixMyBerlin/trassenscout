import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import { MetaTags } from "src/core/layouts"
import { TailwindResponsiveHelper } from "src/core/layouts/TailwindResponsiveHelper/TailwindResponsiveHelper"
import { ContainerParticipation } from "./ContainerParticipation"
import { FooterParticipation } from "./FooterParticipation"
import { HeaderParticipation } from "./HeaderParticipation"

type Props = {
  children?: React.ReactNode
}

export const LayoutParticipation: BlitzLayout<Props> = ({ children }) => {
  return (
    <>
      <Head>
        {/* TODO */}
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
      </Head>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <MetaTags noindex title="Beteiligung RS8" />
        <HeaderParticipation />
        <main className="mx-auto flex w-full flex-col pb-40">
          <ContainerParticipation>{children}</ContainerParticipation>
        </main>
      </div>

      <FooterParticipation />
      <TailwindResponsiveHelper />
    </>
  )
}
