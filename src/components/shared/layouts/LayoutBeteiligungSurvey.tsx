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
        <SurveyHeader landingPageUrl={canonicalUrl} logoSrc={logoUrl} title={title} />
        <main className="mx-auto flex w-full flex-col pb-40">
          <Outlet />
        </main>
        <SurveyFooter />
      </div>
    </>
  )
}
