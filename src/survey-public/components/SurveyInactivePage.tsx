import { SurveyLayout } from "@/src/survey-public/components/core/layout/SurveyLayout"
import { useEffect } from "react"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
import { SurveyLink } from "./core/links/SurveyLink"
import { TSurvey } from "./types"
type Props = {
  surveyDefinition: TSurvey
}
const SurveyInactivePage = ({ surveyDefinition }: Props) => {
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--survey-primary-color", surveyDefinition.primaryColor)
    root.style.setProperty("--survey-dark-color", surveyDefinition.darkColor)
    root.style.setProperty("--survey-light-color", surveyDefinition.lightColor)
  }, [surveyDefinition.darkColor, surveyDefinition.lightColor, surveyDefinition.primaryColor])

  return (
    <SurveyLayout canonicalUrl={surveyDefinition.canonicalUrl} logoUrl={surveyDefinition.logoUrl}>
      <section>
        <SurveyScreenHeader title="Diese Umfrage ist zur Zeit nicht aktiv." />
        <SurveyLink className="mt-32" button="white" href={surveyDefinition.canonicalUrl}>
          Zur Projektwebseite
        </SurveyLink>
      </section>
    </SurveyLayout>
  )
}

export default SurveyInactivePage
