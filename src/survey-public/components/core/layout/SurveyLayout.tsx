import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import { MetaTags } from "src/core/layouts"
import { TailwindResponsiveHelper } from "src/core/layouts/TailwindResponsiveHelper/TailwindResponsiveHelper"
import { SurveyContainer } from "./SurveyContainer"
import { SurveyFooter } from "./SurveyFooter"
import { SurveyHeader } from "./SurveyHeader"

type Props = {
  logoUrl: string

  children?: React.ReactNode
  canonicalUrl: string
}

export const SurveyLayout: BlitzLayout<Props> = ({ logoUrl, children, canonicalUrl }) => {
  const extension = new URL(logoUrl).pathname.split(".").at(-1)
  const mimetype =
    { ico: "image/x-icon", svg: "image/svg+xml", jpg: "image/jpeg", png: "image/png" }[
      extension!
    ] || `image/${extension}`

  return (
    <>
      <Head>
        <link rel="icon" href={logoUrl} type={mimetype} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Head>
      <MetaTags noindex title="Beteiligung RS8" />

      <div className="relative flex h-full flex-col overflow-x-hidden">
        <SurveyHeader landingPageUrl={canonicalUrl} logoSrc={logoUrl} />
        <main className="mx-auto flex w-full flex-col pb-40">
          <SurveyContainer>{children}</SurveyContainer>
        </main>
      </div>

      <SurveyFooter />
      <TailwindResponsiveHelper />
    </>
  )
}
