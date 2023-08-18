import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { PropsWithoutRef } from "react"
import { FormProvider, UseFormProps, useForm } from "react-hook-form"
import {
  LabeledCheckbox,
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
} from "src/core/components/forms"
import { Prettify } from "src/core/types"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { z } from "zod"
import { surveyResponseStatus } from "./surveyResponseStatus"
import { Operator } from "@prisma/client"
import { TFilter } from "src/pages/[projectSlug]/surveys/[surveyId]/responses"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
  filter: TFilter
  setFilter: any // TODO
  schema?: S
  operators: Prettify<Awaited<ReturnType<typeof getOperatorsWithCount>>["operators"]>
  topics: Prettify<
    Awaited<ReturnType<typeof getSurveyResponseTopicsByProject>>["surveyResponseTopics"]
  >
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
}

export function EditableSurveyResponseFilterForm<S extends z.ZodType<any, any>>({
  schema,
  operators,
  topics,
  setFilter,
  initialValues,
}: FormProps<S>) {
  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })

  const handleSubmit = (values: any) => {
    console.log("handleSubmit", { values })
    setFilter({
      ...values,
    })
  }

  return (
    <FormProvider {...methods}>
      <form
        onChange={async () => await methods.handleSubmit(handleSubmit)()}
        className="flex gap-8"
      >
        <div>
          <h4 className="font-bold mb-3">Baulastträger</h4>
          <LabeledRadiobuttonGroup
            scope="operatorFilter"
            items={operators.map((operator: Operator) => {
              return { value: String(operator.id), label: operator.title }
            })}
          />
        </div>
        <div>
          <h4 className="font-bold mb-3">Status</h4>
          <LabeledCheckboxGroup
            classNameItemWrapper={clsx("flex-shrink-0")}
            scope={"statusFilter"}
            items={Object.entries(surveyResponseStatus).map(([value, label]) => {
              return { value, label }
            })}
          />
        </div>
        <div>
          <h4 className="font-bold mb-3">Themenschwerpunkt</h4>
          <LabeledCheckboxGroup
            scope="topicFilter"
            items={topics.map((t) => {
              return {
                value: String(t.id),
                label: t.title,
              }
            })}
          />
        </div>
        <div>
          <h4 className="font-bold mb-3">Notiz</h4>
          <LabeledCheckbox scope="isNoteFilter" value="true" label="Nur Beiträge mit Notiz" />
        </div>
      </form>
    </FormProvider>
  )
}
