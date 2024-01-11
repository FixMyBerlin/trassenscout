import { Markdown } from "src/core/components/Markdown/Markdown"
import { SurveyH1 } from "../Text"

export type SurveyScreenHeaderProps = {
  title: string
  description?: string
}

export const SurveyScreenHeader: React.FC<SurveyScreenHeaderProps> = ({ title, description }) => {
  return (
    <section className="mb-2">
      <div className="mb-8">
        <SurveyH1>{title}</SurveyH1>
      </div>

      {Boolean(description) && (
        <Markdown className="prose-p:text-base prose-p:text-gray-700" markdown={description} />
      )}
    </section>
  )
}
