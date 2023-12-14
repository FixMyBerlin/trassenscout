import { BlitzPage } from "@blitzjs/next"
import { SurveyLayout } from "src/survey-public/components/core/layout/SurveyLayout"
import { TSurvey } from "./types"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
import { SurveyLink } from "./core/links/SurveyLink"
type Props = {
  surveyDefinition: TSurvey
}
const SurveyInactivePage: BlitzPage<Props> = ({ surveyDefinition }) => {
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
