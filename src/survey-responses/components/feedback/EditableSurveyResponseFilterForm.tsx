import {
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
  LabeledTextField,
} from "@/src/core/components/forms"
import { linkStyles } from "@/src/core/components/links"
import { Prettify } from "@/src/core/types"
import getOperatorsWithCount from "@/src/operators/queries/getOperatorsWithCount"
import { TResponse } from "@/src/survey-public/components/types"
import { backendConfig as defaultBackendConfig } from "@/src/survey-public/utils/backend-config-defaults"
import {
  getBackendConfigBySurveySlug,
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { XMarkIcon } from "@heroicons/react/20/solid"
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { Operator } from "@prisma/client"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { PropsWithoutRef, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"

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
    haslocation: queryHaslocation,
    categories: queryCategories,
    searchterm: querySearchTerm,
    additionalFilters: queryAdditionalFilters,
  } = router.query

  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { id: Number(surveyId) })

  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)

  const feedbackQuestions = []

  for (let page of feedbackDefinition.pages) {
    feedbackQuestions.push(...page.questions)
  }

  const feedbackQuestion = feedbackQuestions.find(
    (q) => q.id === evaluationRefs["feedback-category"],
  )
  const searchActive =
    queryOperator &&
    queryStatuses &&
    queryTopics &&
    queryHasnotes &&
    queryHaslocation &&
    queryCategories &&
    querySearchTerm !== undefined

  const backendConfig = getBackendConfigBySurveySlug(survey.slug)
  const surveyResponseStatus = backendConfig.status
  const labels = backendConfig.labels || defaultBackendConfig.labels

  if (!searchActive) {
    void router.push(
      {
        query: {
          ...router.query,
          operator: "ALL", // default: radio "ALL"
          statuses: [...surveyResponseStatus.map((s) => s.value)], // default: all checked
          topics: [...topics.map((t) => String(t.id)), "0"], // default: all checked
          hasnotes: "ALL", // default: radio "ALL"
          haslocation: "ALL", // default: radio "ALL"
          //@ts-expect-error
          categories: [...feedbackQuestion?.props?.responses.map((r: TResponse) => String(r.id))], // default: all checked
          searchterm: "",
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
      statuses: searchActive ? queryStatuses : [...surveyResponseStatus.map((s) => s.value)], // default: all checked
      topics: searchActive ? queryTopics : [...topics.map((t) => String(t.id)), "0"], // default: all checked
      hasnotes: searchActive ? queryHasnotes : "ALL", // default: radio "ALL"
      searchterm: searchActive ? querySearchTerm : "", // default: radio "ALL"
      haslocation: searchActive ? queryHaslocation : "ALL", // default: radio "ALL"
      categories: searchActive
        ? queryCategories
        : //@ts-expect-error
          [...feedbackQuestion?.props?.responses.map((r: TResponse) => String(r.id))], // default: all checked
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
    // @ts-expect-error
    methods.setValue("haslocation", router.query.haslocation)
    // @ts-expect-error
    methods.setValue("categories", router.query.categories)
    // @ts-expect-error
    methods.setValue("searchterm", router.query.searchterm)
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
    ...surveyResponseStatus.map(({ value, label }) => {
      return { value, label }
    }),
  ]
  const topicsOptions = topics.length
    ? [
        ...topics.map((t) => {
          return { value: String(t.id), label: t.title }
        }),
        { value: "0", label: `Ohne ${labels.topics?.sg || "Tag"}` },
      ]
    : []

  // @ts-expect-error
  const categoriesOptions = feedbackQuestion?.props?.responses.map((r: TResponse) => {
    return { value: String(r.id), label: r.text.de }
  })

  const hasnotesOptions = [
    { value: "ALL", label: "Alle" },
    { value: "true", label: `Mit ${labels.note?.sg || defaultBackendConfig.labels.note.sg}` },
    { value: "false", label: `Ohne ${labels.note?.sg || defaultBackendConfig.labels.note.sg}` },
  ]
  const haslocationOptions = [
    { value: "ALL", label: "Alle" },
    {
      value: "true",
      label: `Mit ${labels.location?.sg || defaultBackendConfig.labels.location.sg}`,
    },
    {
      value: "false",
      label: `Ohne ${labels.location?.sg || defaultBackendConfig.labels.location.sg}`,
    },
  ]

  return (
    <nav className="rounded-xl border border-gray-300">
      <details open>
        <summary className="cursor-pointer rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-50">
          Filter
        </summary>
        <FormProvider {...methods}>
          <form
            onChange={async () => await methods.handleSubmit(handleSubmit)()}
            className="flex flex-col items-start justify-start gap-4 rounded-b-xl px-4 py-2"
          >
            <div className="mt-6 flex flex-col gap-12 sm:flex-row">
              <LabeledCheckboxGroup
                label="Status"
                classLabelOverwrite="font-semibold mb-3"
                classNameItemWrapper={clsx("flex-shrink-0")}
                scope={"statuses"}
                items={statusOptions}
              />
              <LabeledRadiobuttonGroup
                label={labels.operator?.sg || defaultBackendConfig.labels.operator.sg}
                classLabelOverwrite="font-semibold mb-3"
                scope="operator"
                items={operatorOptions}
              />
              <LabeledRadiobuttonGroup
                label={labels.note?.sg || defaultBackendConfig.labels.note.sg}
                classLabelOverwrite="font-semibold mb-3"
                scope="hasnotes"
                items={hasnotesOptions}
              />
              <LabeledRadiobuttonGroup
                label={labels.location?.sg || defaultBackendConfig.labels.location.sg}
                classLabelOverwrite="font-semibold mb-3"
                scope="haslocation"
                items={haslocationOptions}
              />
            </div>
            <div className="flex flex-col gap-6 sm:flex-row">
              <LabeledCheckboxGroup
                label={labels.category?.sg || defaultBackendConfig.labels.category.sg}
                classLabelOverwrite="font-semibold mb-3"
                scope="categories"
                items={categoriesOptions}
              />
              {!!topicsOptions.length && (
                <LabeledCheckboxGroup
                  label={labels.topics?.pl || defaultBackendConfig.labels.topics.pl}
                  classLabelOverwrite="font-semibold mb-3"
                  scope="topics"
                  items={topicsOptions}
                  classNameItemWrapper="grid grid-cols-5 grid-rows-6 grid-flow-col-dense"
                />
              )}
            </div>
          </form>
          <form
            className="flex items-end gap-4 rounded-b-xl px-4 pb-2 pt-4"
            onBlur={async () => await methods.handleSubmit(handleSubmit)()}
          >
            <div className="w-[300px]">
              <p className="mb-3 font-semibold">Freitextsuche</p>
              <LabeledTextField
                name="searchterm"
                label=""
                placeholder="Beiträge nach Suchwort filtern"
              />
            </div>
            <button type="button" className="h-full pb-2">
              <MagnifyingGlassCircleIcon className="h-6 w-6 text-blue-500 hover:text-blue-800" />
            </button>
          </form>
          <button
            type="button"
            className={clsx(linkStyles, "mt-4 flex px-4 pb-2")}
            onClick={handleFilterReset}
          >
            <XMarkIcon className="h-4 w-4" />
            Alle Filter zurücksetzen
          </button>
        </FormProvider>
      </details>
    </nav>
  )
}
