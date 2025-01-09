import {
  TFeedbackQuestion,
  TQuestion,
  TReadOnlyProps,
  TSingleOrMultiResponseProps,
  TTextareaProps,
  TTextfieldProps,
} from "@/src/survey-public/components/types"
import { getFormfieldName } from "../utils/getFormfieldNames"
import { SurveyH2 } from "./core/Text"
import { SurveyLabeledCheckboxGroup } from "./core/form/SurveyLabeledCheckboxGroup"
import { SurveyLabeledRadiobuttonGroup } from "./core/form/SurveyLabeledRadiobuttonGroup"
import { SurveyLabeledReadOnlyTextField } from "./core/form/SurveyLabeledReadOnlyTextField"
import { SurveyLabeledTextField } from "./core/form/SurveyLabeledTextField"
import { SurveyLabeledTextareaField } from "./core/form/SurveyLabeledTextareaField"

type TSingleOrMultuResponseComponentProps = {
  id: number
  component: TQuestion["component"] | TFeedbackQuestion["component"]
} & TSingleOrMultiResponseProps

const SingleResponseComponent = ({
  id,
  responses,
  component,
}: TSingleOrMultuResponseComponentProps) => (
  <SurveyLabeledRadiobuttonGroup
    items={responses.map((item) => ({
      scope: getFormfieldName(component, id),
      name: `${id}-${item.id}`,
      label: item.text.de,
      help: item?.help?.de,
      value: `${item.id}`,
    }))}
  />
)

const MultipleResponseComponent = ({
  id,
  responses,
  component,
}: TSingleOrMultuResponseComponentProps) => (
  <SurveyLabeledCheckboxGroup
    key={id}
    items={responses.map((item) => ({
      name: `${getFormfieldName(component, id)}-${item.id}`,
      label: item.text.de,
      help: item?.help?.de,
    }))}
  />
)

type TTextfieldResponseComponentProps = {
  id: number
  component: TQuestion["component"] | TFeedbackQuestion["component"]
} & TTextfieldProps

type TTextareaResponseComponentProps = {
  id: number
  component: TQuestion["component"] | TFeedbackQuestion["component"]
} & TTextareaProps

type TReadOnlyResponseComponentProps = {
  id: number
  component: TQuestion["component"] | TFeedbackQuestion["component"]
} & TReadOnlyProps

const TextResponseComponent = ({
  id,
  placeholder,
  caption,
  validation,
  component,
}: TTextareaResponseComponentProps) => (
  <>
    <SurveyLabeledTextareaField
      name={getFormfieldName(component, id)}
      label={""}
      placeholder={placeholder?.de}
      caption={caption?.de}
      maxLength={validation?.maxLength}
    />
  </>
)

const TextFieldResponseComponent = ({
  id,
  placeholder,
  component,
}: TTextfieldResponseComponentProps) => (
  <>
    <SurveyLabeledTextField
      name={getFormfieldName(component, id)}
      placeholder={placeholder?.de}
      label={""}
    />
  </>
)

const ReadOnlyResponseComponent = ({ id, queryId, component }: TReadOnlyResponseComponentProps) => (
  <>
    <SurveyLabeledReadOnlyTextField
      readOnly
      name={getFormfieldName(component, id)}
      label={""}
      queryId={queryId}
    />
  </>
)

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
  textfield: TextFieldResponseComponent,
  readOnly: ReadOnlyResponseComponent,
  custom: CustomComponent,
}

type Props = { question: TQuestion | TFeedbackQuestion; className?: string }

export const Question = ({ question, className }: Props) => {
  const { id, help, label, component, props } = question
  // @ts-expect-error
  const Component = components[component] || null

  // todo validation: atm multipleResponse is always optional - we have to change this in the future
  // @ts-expect-error
  const isOptional = component === "multipleResponse" || props?.validation?.optional
  return (
    <div className={className} key={id}>
      <SurveyH2>
        {label.de} {isOptional && " (optional)"}
      </SurveyH2>
      {help && <div className="-mt-4 mb-6 text-sm text-gray-400">{help.de}</div>}
      {/* @ts-ignore */}
      {Component && <Component component={component} id={id} {...props} />}
    </div>
  )
}
