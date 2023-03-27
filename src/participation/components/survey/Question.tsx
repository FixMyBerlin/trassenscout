import clsx from "clsx"
import { H2 } from "src/core/components/text/Headings"
import { ParticipationLabeledCheckboxGroup } from "../form/ParticipationLabeledCheckboxGroup"
import { ParticipationLabeledRadiobuttonGroup } from "../form/ParticipationLabeledRadiobuttonGroup"
import { ParticipationLabeledTextareaField } from "../form/ParticipationLabeledTextareaField"
import { TQuestion } from "./Page"
export { FORM_ERROR } from "src/core/components/forms"

const SingleResponseComponent = ({ id, responses }) => (
  <ParticipationLabeledRadiobuttonGroup
    items={responses.map((item) => ({
      scope: `single-${id}`,
      name: item.text.de,
      label: item.text.de,
      value: item.id,
    }))}
  />
)

const MultipleResponseComponent = ({ id, responses }) => (
  <ParticipationLabeledCheckboxGroup
    key={id}
    items={responses.map((item) => ({
      name: `multi-${id}-${item.id}`,
      label: item.text.de,
    }))}
  />
)

const TextResponseComponent = ({ id, caption }) => (
  <>
    <ParticipationLabeledTextareaField name={`text-${id}`} label={""} />
    <p className="mt-2 text-right text-sm text-gray-500">{caption.de}</p>
  </>
)

const CustomComponent = (props) => (
  <>
    <div className="border-2 border-black bg-gray-200 p-1">
      <code>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </code>
    </div>
  </>
)

const components = {
  singleResponse: SingleResponseComponent,
  multipleResponse: MultipleResponseComponent,
  text: TextResponseComponent,
  custom: CustomComponent,
}

type Props = { question: TQuestion; className?: string }

export const Question: React.FC<Props> = ({ question, className }) => {
  const { id, label, component, props } = question
  const Component = components[component] || null
  return (
    <div className={className} key={id}>
      <H2 className="mb-8">{label.de}</H2>
      {Component && <Component id={id} {...props} />}
    </div>
  )
}
