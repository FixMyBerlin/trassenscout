import { TQuestion, TSingleOrMultiResponseProps } from "src/survey-public/components/types"
import { SurveyH2 } from "./core/Text"
import { SurveyLabeledCheckboxGroup } from "./core/form/SurveyLabeledCheckboxGroup"
import { SurveyLabeledRadiobuttonGroup } from "./core/form/SurveyLabeledRadiobuttonGroup"
import { SurveyLabeledTextareaField } from "./core/form/SurveyLabeledTextareaField"
export { FORM_ERROR } from "src/core/components/forms"

type TSingleOrMultuResponseComponentProps = {
  id: number
} & TSingleOrMultiResponseProps

const SingleResponseComponent: React.FC<TSingleOrMultuResponseComponentProps> = ({
  id,
  responses,
}) => (
  <SurveyLabeledRadiobuttonGroup
    items={responses.map((item) => ({
      scope: `single-${id}`,
      name: `${id}-${item.id}`,
      label: item.text.de,
      help: item?.help?.de,
      value: `${item.id}`,
      primaryColor: "red", // todo frm7
    }))}
  />
)

const MultipleResponseComponent: React.FC<TSingleOrMultuResponseComponentProps> = ({
  id,
  responses,
}) => (
  <SurveyLabeledCheckboxGroup
    key={id}
    items={responses.map((item) => ({
      name: `multi-${id}-${item.id}`,
      label: item.text.de,
      help: item?.help?.de,
      primaryColor: "red", // todo frm7
    }))}
  />
)

type TTextResponseComponentProps = {
  id: number
  primaryColor: "red" | "pink"
}

const TextResponseComponent: React.FC<TTextResponseComponentProps> = ({
  id,
  primaryColor = "red", // todo frm7
}) => (
  <>
    <SurveyLabeledTextareaField primaryColor={primaryColor} name={`text-${id}`} label={""} />
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

type Props = { question: TQuestion; className?: string; primaryColor: "red" | "pink" }

export const Question: React.FC<Props> = ({ question, className }) => {
  const { id, label, component, props } = question
  const Component = components[component] || null
  return (
    <div className={className} key={id}>
      <SurveyH2>{label.de}</SurveyH2>
      {/* @ts-ignore */}
      {Component && <Component id={id} {...props} />}
    </div>
  )
}
