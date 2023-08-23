import { zodResolver } from "@hookform/resolvers/zod"
import { Operator } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { PropsWithoutRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { LabeledCheckboxGroup, LabeledRadiobuttonGroup } from "src/core/components/forms"
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
}

export function EditableSurveyResponseFilterForm<S extends z.ZodType<any, any>>({
  schema,
  operators,
  topics,
}: FormProps<S>) {
  const router = useRouter()
  const {
    operator: queryOperator,
    statuses: queryStatuses,
    topics: queryTopics,
    hasnotes: queryHasnotes,
  } = router.query
  // TODO: Resetting the form does not work, yet. The searchActive was supposed to help but does not fix it.
  // For some reason the router.query destructuring above still has the old values after handleFilterReset was called.
  // I tried different ways to reset the filters. One can see a quick flicker of the empty URL after handleFilterReset was called.
  const searchActive = queryOperator && queryStatuses && queryTopics && queryHasnotes
  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: async () => ({
      operator: (searchActive && queryOperator) || "ALL", // default: radio "ALL"
      statuses: (searchActive && queryStatuses) || [...Object.keys(surveyResponseStatus)], // default: all checked
      topics: (searchActive && queryTopics) || [...topics.map((t) => String(t.id)), "0"], // default: all checked
      hasnotes: (searchActive && queryHasnotes) || "ALL", // default: radio "ALL"
    }),
  })

  const handleSubmit = async (values: any) => {
    await router.push({ query: { ...router.query, ...values } }, undefined, { scroll: false })
  }

  const handleFilterReset = async () => {
    methods.reset()
    delete router.query.operator
    delete router.query.statuses
    delete router.query.topics
    delete router.query.hasnotes
    await router.push({ query: { ...router.query } }, undefined, { scroll: false })
  }

  const operatorOptions = [
    { value: "ALL", label: "Alle" },
    ...operators.map((operator: Operator) => {
      return { value: String(operator.id), label: operator.title }
    }),
    { value: "0", label: "Nicht zugeordnet" },
  ]
  const statusOptions = [
    ...Object.entries(surveyResponseStatus).map(([value, label]) => {
      return { value, label }
    }),
  ]
  const topicsOptions = [
    ...topics.map((t) => {
      return { value: String(t.id), label: t.title }
    }),
    { value: "0", label: "ohne Themenschwerpunkt" },
  ]
  const hasnotesOptions = [
    { value: "ALL", label: "Alle" },
    { value: "true", label: "Mit Notiz" },
    { value: "false", label: "Ohne Notiz" },
  ]

  return (
    <nav>
      <details open>
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
              items={operatorOptions}
            />
            <LabeledCheckboxGroup
              label="Status"
              classLabelOverwrite="font-bold mb-3"
              classNameItemWrapper={clsx("flex-shrink-0")}
              scope={"statuses"}
              items={statusOptions}
            />
            <LabeledCheckboxGroup
              label="Themenschwerpunkt"
              classLabelOverwrite="font-bold mb-3"
              scope="topics"
              items={topicsOptions}
            />
            <LabeledRadiobuttonGroup
              label="Notiz"
              classLabelOverwrite="font-bold mb-3"
              scope="hasnotes"
              items={hasnotesOptions}
            />
            <button type="button" className={linkStyles} onClick={handleFilterReset}>
              Filter löschen
            </button>
          </form>
        </FormProvider>
      </details>
    </nav>
  )
}
