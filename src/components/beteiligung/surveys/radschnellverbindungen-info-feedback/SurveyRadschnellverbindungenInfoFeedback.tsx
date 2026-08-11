import { SurveyMainPage } from "@/src/components/beteiligung/SurveyMainPage"

type Props = {
  surveyId: number
}

export const SurveyRadschnellverbindungenInfoFeedback = ({ surveyId }: Props) => {
  return <SurveyMainPage surveyId={surveyId} />
}
