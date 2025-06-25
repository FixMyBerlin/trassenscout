import { SurveyMainPage } from "@/src/app/beteiligung/_components/SurveyMainPage"
type Props = {
  surveyId: number
}

export const SurveyOhvHaltestellenfoerderung = ({ surveyId }: Props) => {
  return <SurveyMainPage surveyId={surveyId} />
}
