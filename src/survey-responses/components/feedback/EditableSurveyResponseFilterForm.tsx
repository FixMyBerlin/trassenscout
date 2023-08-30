import { zodResolver } from "@hookform/resolvers/zod"
import { Operator } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { PropsWithoutRef, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { LabeledCheckboxGroup, LabeledRadiobuttonGroup } from "src/core/components/forms"
import { linkStyles } from "src/core/components/links"
import { Prettify } from "src/core/types"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { z } from "zod"
import { surveyResponseStatus } from "./surveyResponseStatus"
import { XMarkIcon } from "@heroicons/react/20/solid"

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

  const searchActive = queryOperator && queryStatuses && queryTopics && queryHasnotes
  if (!searchActive) {
    void router.push(
      {
        query: {
          ...router.query,
          operator: "ALL", // default: radio "ALL"
          statuses: [...Object.keys(surveyResponseStatus)], // default: all checked
          topics: [...topics.map((t) => String(t.id)), "0"], // default: all checked
          hasnotes: "ALL", // default: radio "ALL"
        },
      },
      undefined,
      { scroll: false },
    )
  }
  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: async () => ({
      operator: searchActive ? queryOperator : "ALL", // default: radio "ALL"
      statuses: searchActive ? queryStatuses : [...Object.keys(surveyResponseStatus)], // default: all checked
      topics: searchActive ? queryTopics : [...topics.map((t) => String(t.id)), "0"], // default: all checked
      hasnotes: searchActive ? queryHasnotes : "ALL", // default: radio "ALL"
    }),
  })

  // to update the checked items in the checkbox list when we add a new topic in EditableSurveyResponseForm (with handleNewTopic()), we need to set the form values here
  useEffect(() => {
    // @ts-expect-error
    methods.setValue("operator", router.query.operator)
    // @ts-expect-error
    methods.setValue("statuses", router.query.statuses)
    // @ts-expect-error
    methods.setValue("topics", router.query.topics)
    // @ts-expect-error
    methods.setValue("hasnotes", router.query.hasnotes)
  }, [methods, router])

  const handleSubmit = async (values: any) => {
    await router.push({ query: { ...router.query, ...values } }, undefined, { scroll: false })
  }

  const handleFilterReset = async () => {
    methods.reset()
    await router.push(
      { query: { projectSlug: router.query.projectSlug, surveyId: router.query.surveyId } },
      undefined,
      { scroll: false },
    )
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
    { value: "0", label: "Ohne Thema" },
  ]
  const hasnotesOptions = [
    { value: "ALL", label: "Alle" },
    { value: "true", label: "Mit Notiz" },
    { value: "false", label: "Ohne Notiz" },
  ]

  return (
    <nav className="border border-gray-300 rounded-xl">
      <details>
        <summary className="px-4 py-2 cursor-pointer text-gray-700 hover:bg-gray-50 rounded-xl">
          Filter
        </summary>
        <FormProvider {...methods}>
          <form
            onChange={async () => await methods.handleSubmit(handleSubmit)()}
            className="flex flex-col gap-4 justify-start items-start px-4 py-2 rounded-b-xl"
          >
            <div className="flex flex-col sm:flex-row gap-12 mt-6">
              <LabeledCheckboxGroup
                label="Status"
                classLabelOverwrite="font-bold mb-3"
                classNameItemWrapper={clsx("flex-shrink-0")}
                scope={"statuses"}
                items={statusOptions}
              />
              <LabeledRadiobuttonGroup
                label="Baulastträger"
                classLabelOverwrite="font-bold mb-3"
                scope="operator"
                items={operatorOptions}
              />
              <LabeledRadiobuttonGroup
                label="Notiz"
                classLabelOverwrite="font-bold mb-3"
                scope="hasnotes"
                items={hasnotesOptions}
              />
              <LabeledCheckboxGroup
                label="Themen"
                classLabelOverwrite="font-bold mb-3"
                scope="topics"
                items={topicsOptions}
                classNameItemWrapper="grid grid-cols-3 grid-rows-10 grid-flow-col-dense"
              />
            </div>
            <button type="button" className={clsx(linkStyles, "flex")} onClick={handleFilterReset}>
              <XMarkIcon className="h-4 w-4" />
              Alle Filter zurücksetzen
            </button>
          </form>
        </FormProvider>
      </details>
    </nav>
  )
}
