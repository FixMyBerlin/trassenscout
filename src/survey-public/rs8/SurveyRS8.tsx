import { SurveyMainPage } from "src/survey-public/components/SurveyMainPage"
import { emailDefinition } from "src/survey-public/rs8/data/email"
import { feedbackDefinition } from "src/survey-public/rs8/data/feedback"
import { moreDefinition } from "src/survey-public/rs8/data/more"
import { stageProgressDefinition } from "src/survey-public/rs8/data/progress"
import { surveyDefinition } from "src/survey-public/rs8/data/survey"

export const SurveyRS8: React.FC = () => {
  return (
    <SurveyMainPage
      emailDefinition={emailDefinition}
      feedbackDefinition={feedbackDefinition}
      moreDefinition={moreDefinition}
      stageProgressDefinition={stageProgressDefinition}
      surveyDefinition={surveyDefinition}
    />
  )
}
