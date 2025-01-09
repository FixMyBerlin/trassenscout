import { SurveyMarkdown } from "../SurveyMarkdown"
import { SurveyH1 } from "../Text"

export type Props = {
  title: string
  description?: string
}

export const SurveyScreenHeader = ({ title, description }: Props) => {
  return (
    <section className="mb-2">
      <div className="mb-8">
        <SurveyH1>{title}</SurveyH1>
      </div>

      {Boolean(description) && <SurveyMarkdown markdown={description} />}
    </section>
  )
}
