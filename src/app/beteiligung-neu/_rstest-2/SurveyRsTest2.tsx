import { SurveyMainPage } from "@/src/app/beteiligung-neu/_components/SurveyMainPage"
type Props = {
  surveyId: number
}

export const SurveyRsTest2 = ({ surveyId }: Props) => {
  return <SurveyMainPage surveyId={surveyId} />
}
