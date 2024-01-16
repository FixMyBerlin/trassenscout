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
        // todo color handling
        <Markdown
          className="prose-p:text-base prose-p:sm:text-lg hover:prose-a:text-[#5F071B] prose-p:text-gray-700 prose-a:text-base prose-a:underline prose-a:sm:text-lg prose-a:text-[#D60F3D]"
          markdown={description}
        />
      )}
    </section>
  )
}
