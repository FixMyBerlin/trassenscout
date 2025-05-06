import { SurveyMainPage } from "@/src/app/beteiligung-neu/_components/SurveyMainPage"
type Props = {
  surveyId: number
}

export const SurveyRs23Test = ({ surveyId }: Props) => {
  return <SurveyMainPage surveyId={surveyId} />
}
