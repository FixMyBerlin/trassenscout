import { SurveyMainPage } from "@/src/components/beteiligung/SurveyMainPage"
type Props = {
  surveyId: number
}

export const SurveyRsTest1 = ({ surveyId }: Props) => {
  return <SurveyMainPage surveyId={surveyId} />
}
