import { SurveyMainPage } from "@/src/components/beteiligung/SurveyMainPage"
type Props = {
  surveyId: number
}

export const SurveyRS8 = ({ surveyId }: Props) => {
  return <SurveyMainPage surveyId={surveyId} />
}
