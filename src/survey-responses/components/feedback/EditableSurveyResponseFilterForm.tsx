import { zodResolver } from "@hookform/resolvers/zod"
import { Operator } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { PropsWithoutRef } from "react"
import { FormProvider, UseFormProps, useForm } from "react-hook-form"
import { SuperAdminBox } from "src/core/components/AdminBox"
import {
  LabeledCheckbox,
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
} from "src/core/components/forms"
import { linkStyles } from "src/core/components/links"
import { Prettify } from "src/core/types"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { z } from "zod"
import { surveyResponseStatus } from "./surveyResponseStatus"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
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
  initialValues,
}: FormProps<S>) {
  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })

  const router = useRouter()
  const handleSubmit = async (values: any) => {
    await router.push({ query: { ...router.query, ...values } })
  }

  const handleFilterReset = async () => {
    await router.push(
      { query: { projectSlug: router.query.projectSlug, surveyId: router.query.surveyId } },
      undefined,
      { scroll: false },
    )
  }

  return (
    <nav>
      <details>
        <summary className="cursor-pointer text-gray-700 hover:text-gray-80">Filter</summary>

        <SuperAdminBox>
          <code>{JSON.stringify(router.query, undefined, 2)}</code>
        </SuperAdminBox>
        <FormProvider {...methods}>
          <form
            onChange={async () => await methods.handleSubmit(handleSubmit)()}
            className="flex gap-8 justify-start items-start"
          >
            <LabeledRadiobuttonGroup
              label="Baulastträger"
              classLabelOverwrite="font-bold mb-3"
              scope="operator"
              items={operators.map((operator: Operator) => {
                return { value: String(operator.id), label: operator.title }
              })}
            />
            <LabeledCheckboxGroup
              label="Status"
              classLabelOverwrite="font-bold mb-3"
              classNameItemWrapper={clsx("flex-shrink-0")}
              scope={"status"}
              items={Object.entries(surveyResponseStatus).map(([value, label]) => {
                return { value, label }
              })}
            />
            <LabeledCheckboxGroup
              label="Themenschwerpunkt"
              classLabelOverwrite="font-bold mb-3"
              scope="topic"
              items={topics.map((t) => {
                return {
                  value: String(t.id),
                  label: t.title,
                }
              })}
            />
            <div>
              <h4 className="font-bold mb-3">Notiz</h4>
              <LabeledCheckbox scope="hasnotes" value="true" label="Nur Beiträge mit Notiz" />
            </div>

            <button className={linkStyles} onClick={handleFilterReset}>
              Filter löschen
            </button>
          </form>
        </FormProvider>
      </details>
    </nav>
  )
}
