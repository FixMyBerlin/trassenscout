import { BlitzLayout, useParam } from "@blitzjs/next"
import Head from "next/head"
import { TailwindResponsiveHelper } from "src/core/layouts/TailwindResponsiveHelper/TailwindResponsiveHelper"
import { SurveyMetaTags } from "../SurveyMetaTags"
import { SurveyContainer } from "./SurveyContainer"
import { SurveyFooter } from "./SurveyFooter"
import { SurveyHeader } from "./SurveyHeader"

type Props = {
  logoUrl: string
  primaryColor: "red" | "pink"
  children?: React.ReactNode
  canonicalUrl: string
}

export const SurveyLayout: BlitzLayout<Props> = ({
  logoUrl,
  children,
  canonicalUrl,
  primaryColor,
}) => {
  const surveySlug = useParam("surveySlug", "string")
  const extension = new URL(logoUrl).pathname.split(".").at(-1)
  const mimetype =
    { ico: "image/x-icon", svg: "image/svg+xml", jpg: "image/jpeg", png: "image/png" }[
      extension!
    ] || `image/${extension}`

  return (
    <>
      <Head>
        <link rel="icon" href={logoUrl} type={mimetype} />
        {/* <link rel="icon" href="favicon.svg" type="image/svg+xml" /> */}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Head>
      <SurveyMetaTags
        canonicalUrl={canonicalUrl}
        title={`Beteiligung ${surveySlug?.toUpperCase()}`}
      />

      <div className="relative flex h-full flex-col overflow-x-hidden">
        <SurveyHeader primaryColor={primaryColor} landingPageUrl={canonicalUrl} logoSrc={logoUrl} />
        <main className="mx-auto flex w-full flex-col pb-40">
          <SurveyContainer>{children}</SurveyContainer>
        </main>
      </div>

      <SurveyFooter />
      <TailwindResponsiveHelper />
    </>
  )
}
