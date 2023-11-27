import { SingleOrMultiResponseProps, TextResponseProps } from "src/participation/data/types"
import { Question as TQuestion } from "src/participation/data/types"
import { ParticipationH2 } from "./Text"
import { ParticipationLabeledCheckboxGroup } from "./form/ParticipationLabeledCheckboxGroup"
import { ParticipationLabeledRadiobuttonGroup } from "./form/ParticipationLabeledRadiobuttonGroup"
import { ParticipationLabeledTextareaField } from "./form/ParticipationLabeledTextareaField"
export { FORM_ERROR } from "src/core/components/forms"

type TSingleOrMultuResponseComponentProps = {
  id: number
} & SingleOrMultiResponseProps

const SingleResponseComponent: React.FC<TSingleOrMultuResponseComponentProps> = ({
  id,
  responses,
}) => (
  <ParticipationLabeledRadiobuttonGroup
    items={responses.map((item) => ({
      scope: `single-${id}`,
      name: `${id}-${item.id}`,
      label: item.text.de,
      help: item?.help?.de,
      value: `${item.id}`,
    }))}
  />
)

const MultipleResponseComponent: React.FC<TSingleOrMultuResponseComponentProps> = ({
  id,
  responses,
}) => (
  <ParticipationLabeledCheckboxGroup
    key={id}
    items={responses.map((item) => ({
      name: `multi-${id}-${item.id}`,
      label: item.text.de,
      help: item?.help?.de,
    }))}
  />
)

type TTextResponseComponentProps = {
  id: number
} & TextResponseProps

const TextResponseComponent: React.FC<TTextResponseComponentProps> = ({ id }) => (
  <>
    <ParticipationLabeledTextareaField name={`text-${id}`} label={""} />
  </>
)

// TODO type
const CustomComponent = (props: any) => (
  <div className="border-2 border-black bg-gray-200 p-1">
    <code>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </code>
  </div>
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
      <ParticipationH2>{label.de}</ParticipationH2>
      {/* @ts-ignore */}
      {Component && <Component id={id} {...props} />}
    </div>
  )
}
