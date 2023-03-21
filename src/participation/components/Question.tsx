import { H2 } from "src/core/components/text/Headings"
import { ParticipationLabeledCheckboxGroup } from "./form/ParticipationLabeledCheckboxGroup"
import { ParticipationLabeledRadiobuttonGroup } from "./form/ParticipationLabeledRadiobuttonGroup"
import { ParticipationLabeledTextareaField } from "./form/ParticipationLabeledTextareaField"
import { TQuestion } from "./pages/Page"
export { FORM_ERROR } from "src/core/components/forms"

const SingleResponseComponent = ({ id, responses }) => (
  <ParticipationLabeledRadiobuttonGroup
    items={responses.map((item) => ({
      scope: String(id),
      name: item.text.de,
      label: item.text.de,
      value: item.text.de,
    }))}
  />
)

const MultipleResponseComponent = ({ id, responses }) => (
  <ParticipationLabeledCheckboxGroup
    key={id}
    items={responses.map((item) => ({
      name: item.text.de,
      label: item.text.de,
    }))}
  />
)

const TextResponseComponent = ({ id }) => (
  <>
    <ParticipationLabeledTextareaField name={String(id)} label={""} />
    <p className="mt-2 text-right text-sm text-gray-500">Max. 2000 Zeichen</p>
  </>
)

const components = {
  singleResponse: SingleResponseComponent,
  multipleResponse: MultipleResponseComponent,
  text: TextResponseComponent,
}

type Props = { question: TQuestion }

export const Question: React.FC<Props> = ({ question }) => {
  const { id, label, component, props } = question
  const Component = components[component]
  return (
    <div key={id}>
      <H2>{label.de}</H2>
      <Component id={id} {...props} />
    </div>
  )
}
