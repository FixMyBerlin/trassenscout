import { SurveyFooter } from "@/src/app/beteiligung/_components/layout/SurveyFooter"
import { SurveyHeader } from "@/src/app/beteiligung/_components/layout/SurveyHeader"
import "@/src/app/beteiligung/_components/stripe-backgrounds.css"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { Metadata } from "next"

type Props = {
  params: { surveySlug: AllowedSurveySlugs }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surveySlug } = params
  const { logoUrl, canonicalUrl, title } = getConfigBySurveySlug(surveySlug, "meta")

  return {
    title: `${title} ${surveySlug?.toUpperCase()}`,
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
  const { canonicalUrl, logoUrl, primaryColor, darkColor, lightColor, title } =
    getConfigBySurveySlug(surveySlug, "meta")

  const themeStyles = `
    :root {
      --survey-primary-color: ${primaryColor};
      --survey-dark-color: ${darkColor};
      --survey-light-color: ${lightColor};
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <SurveyHeader landingPageUrl={canonicalUrl} logoSrc={logoUrl} title={title} />
        <main className="mx-auto flex w-full flex-col pb-40">{children}</main>
        <SurveyFooter />
      </div>
    </>
  )
}
