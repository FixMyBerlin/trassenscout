import { useEffect } from "react"
import { SurveyContainer } from "@/src/components/beteiligung/layout/SurveyContainer"
import { SurveyScreenHeader } from "@/src/components/beteiligung/layout/SurveyScreenHeader"
import { SurveyLink } from "@/src/components/beteiligung/links/SurveyLink"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"

const SurveyInactivePage = ({ surveySlug }: { surveySlug: AllowedSurveySlugs }) => {
  const {
    canonicalUrl,
    primaryColor,
    darkColor,
    lightColor,
    logoUrl: _logoUrl,
  } = getConfigBySurveySlug(surveySlug, "meta")
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--survey-primary-color", primaryColor)
    root.style.setProperty("--survey-dark-color", darkColor)
    root.style.setProperty("--survey-light-color", lightColor)
  }, [darkColor, lightColor, primaryColor])

  return (
    <SurveyContainer>
      <SurveyScreenHeader title="Diese Umfrage ist zur Zeit nicht aktiv." />
      <SurveyLink className="mt-32" button="white" href={canonicalUrl}>
        Zur Projektwebseite
      </SurveyLink>
    </SurveyContainer>
  )
}

export default SurveyInactivePage
