import { Outlet } from "@tanstack/react-router"
import { SurveyFooter } from "@/src/components/beteiligung/layout/SurveyFooter"
import { SurveyHeader } from "@/src/components/beteiligung/layout/SurveyHeader"
import "@/src/components/beteiligung/stripe-backgrounds.css"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { Route } from "@/src/routes/beteiligung/$surveySlug"

export function LayoutBeteiligungSurvey() {
  const { surveySlug } = Route.useParams()
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
        <a
          href="#survey-main-content"
          className="sr-only z-50 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-2 ring-(--survey-dark-color) focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
        >
          Zum Hauptinhalt springen
        </a>
        <SurveyHeader landingPageUrl={canonicalUrl} logoSrc={logoUrl} title={title} />
        <main id="survey-main-content" className="mx-auto flex w-full flex-col pb-40" tabIndex={-1}>
          <Outlet />
        </main>
        <SurveyFooter />
      </div>
    </>
  )
}
