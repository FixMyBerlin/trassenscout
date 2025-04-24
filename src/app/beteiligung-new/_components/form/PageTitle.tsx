import { SurveyH1 } from "@/src/app/beteiligung-new/_components/Text"

export const SurveyPageTitle = ({ title }: { title: string }) => {
  return (
    <div className="mb-8">
      <SurveyH1>{title}</SurveyH1>
    </div>
  )
}
