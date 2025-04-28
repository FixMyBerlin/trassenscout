import { SurveyFooter } from "@/src/app/beteiligung-neu/_components/layout/SurveyFooter"
import { SurveyHeader } from "@/src/app/beteiligung-neu/_components/layout/SurveyHeader"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { Metadata } from "next"

type Props = {
  params: { surveySlug: AllowedSurveySlugs }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surveySlug } = params
  const { logoUrl, canonicalUrl } = getConfigBySurveySlug(surveySlug, "meta")

  return {
    title: `Beteiligung ${surveySlug?.toUpperCase()}`,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: logoUrl,
    },
    robots: {
      index: false,
    },
    openGraph: {
      url: canonicalUrl,
    },
    description: "Beteiligung",
  }
}

export default function SurveyLayout({ params: { surveySlug }, children }: Props) {
  const { canonicalUrl, logoUrl } = getConfigBySurveySlug(surveySlug, "meta")

  return (
    <>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <SurveyHeader landingPageUrl={canonicalUrl} logoSrc={logoUrl} />
        <main className="mx-auto flex w-full flex-col pb-40">{children}</main>
        <SurveyFooter />
      </div>
    </>
  )
}
