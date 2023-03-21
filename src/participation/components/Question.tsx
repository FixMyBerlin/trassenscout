import { H2 } from "src/core/components/text/Headings"
import { ParticipationLabeledCheckboxGroup } from "./form/ParticipationLabeledCheckboxGroup"
import { ParticipationLabeledRadiobuttonGroup } from "./form/ParticipationLabeledRadiobuttonGroup"
import { ParticipationLabeledTextareaField } from "./form/ParticipationLabeledTextareaField"
import { TQuestion } from "./pages/Page"
export { FORM_ERROR } from "src/core/components/forms"

type QuestionGroupProps = { question: TQuestion }

const QuestionGroup: React.FC<QuestionGroupProps> = ({ question }) => {
  const { id, component, props } = question
  const { responses } = props
  if (!responses) return null
  if (component === "singleResponse")
    return (
      <ParticipationLabeledRadiobuttonGroup
        key={id}
        items={responses.map((item) => ({
          scope: String(id),
          name: item.text.de,
          label: item.text.de,
          value: item.text.de,
        }))}
      />
    )
  if (component === "multipleResponse")
    return (
      <ParticipationLabeledCheckboxGroup
        key={id}
        items={responses.map((item) => ({
          name: item.text.de,
          label: item.text.de,
        }))}
      />
    )
    return (
      <>
        <ParticipationLabeledTextareaField name={String(id)} label={""} />
        <p className="mt-2 text-right text-sm text-gray-500">Max. 2000 Zeichen</p>
      </>
    )
}

type Props = { question: TQuestion }

export const Question: React.FC<Props> = ({ question }) => {
  if (!question) return null
  const { id, label } = question
  return (
    <div key={question.id}>
      <H2>{question.label.de}</H2>
      <QuestionGroup question={question} />
    </div>
  )
}
