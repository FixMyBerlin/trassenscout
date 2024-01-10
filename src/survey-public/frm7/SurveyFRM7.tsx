import { SurveyMainPage } from "src/survey-public/components/SurveyMainPage"
import { emailDefinition } from "src/survey-public/frm7/data/email"
import { feedbackDefinition } from "src/survey-public/frm7/data/feedback"
import { moreDefinition } from "src/survey-public/frm7/data/more"
import { stageProgressDefinition } from "src/survey-public/frm7/data/progress"
import { surveyDefinition } from "src/survey-public/frm7/data/survey"
import { responseConfig } from "./data/response-config"
type Props = {
  surveyId: number
}
export const SurveyFRM7: React.FC<Props> = ({ surveyId }) => {
  return (
    <SurveyMainPage
      surveyId={surveyId}
      emailDefinition={emailDefinition}
      feedbackDefinition={feedbackDefinition}
      moreDefinition={moreDefinition}
      stageProgressDefinition={stageProgressDefinition}
      surveyDefinition={surveyDefinition}
      responseConfig={responseConfig}
    />
  )
}
