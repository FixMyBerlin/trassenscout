"use client"

import { SurveyContainer } from "@/src/app/beteiligung-neu/_components/layout/SurveyContainer"
import { SurveyScreenHeader } from "@/src/app/beteiligung-neu/_components/layout/SurveyScreenHeader"
import { SurveyLink } from "@/src/app/beteiligung-neu/_components/links/SurveyLink"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { useEffect } from "react"

const SurveyInactivePage = ({ surveySlug }: { surveySlug: AllowedSurveySlugs }) => {
  const { canonicalUrl, primaryColor, darkColor, lightColor, logoUrl } = getConfigBySurveySlug(
    surveySlug,
    "meta",
  )
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
