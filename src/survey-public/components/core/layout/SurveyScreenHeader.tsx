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
        <Markdown
          className="prose-p:text-base prose-p:sm:text-lg  prose-p:text-gray-700 prose-a:text-base prose-a:underline prose-a:sm:text-lg prose-a:text-[var(--survey-primary-color)] hover:prose-a:text-[var(--survey-dark-color)]"
          markdown={description}
        />
      )}
    </section>
  )
}
