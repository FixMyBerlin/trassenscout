import { SurveyMainPage } from "@/src/components/beteiligung/SurveyMainPage"
type Props = {
  surveyId: number
}

export const SurveyRsTest2 = ({ surveyId }: Props) => {
  return <SurveyMainPage surveyId={surveyId} />
}
