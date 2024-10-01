import {
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
  LabeledTextField,
} from "@/src/core/components/forms"
import { linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/hooks"
import { Prettify } from "@/src/core/types"
import getOperatorsWithCount from "@/src/operators/queries/getOperatorsWithCount"
import { TResponse, TSingleOrMultiResponseProps } from "@/src/survey-public/components/types"
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
import { PropsWithoutRef, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { useDefaultFilterValues } from "./useDefaultFilterValues"
import { useFilters } from "./useFilters.nuqs"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
  schema?: S
  operators: Prettify<Awaited<ReturnType<typeof getOperatorsWithCount>>["operators"]>
  topicsDefinition: Prettify<
    Awaited<ReturnType<typeof getSurveyResponseTopicsByProject>>["surveyResponseTopics"]
  >
}

export function EditableSurveyResponseFilterForm<S extends z.ZodType<any, any>>({
  schema,
  operators,
  topicsDefinition,
}: FormProps<S>) {
  const surveyId = useParam("surveyId", "string")
  const projectSlug = useProjectSlug()
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })

  const filterDefault = useDefaultFilterValues()

  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)

  const feedbackQuestions = []
  for (let page of feedbackDefinition.pages) {
    feedbackQuestions.push(...page.questions)
  }
  const categoryQuestionProps = feedbackQuestions.find(
    (q) => q.id === evaluationRefs["feedback-category"],
  )!.props as TSingleOrMultiResponseProps

  // backend configurations: status
  const backendConfig = getBackendConfigBySurveySlug(survey.slug)
  const surveyResponseStatus = backendConfig.status

  const [{ status, operator, hasnotes, haslocation, categories, topics, searchterm }, setFilter] =
    useFilters()

  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: async () => ({
      status,
      operator,
      hasnotes,
      haslocation,
      categories,
      topics,
      searchterm,
    }),
  })

  // to update the checked items in the checkbox list when we add a new topic in EditableSurveyResponseForm (with handleNewTopic()), we need to set the form values here
  useEffect(() => {
    // @ts-expect-error
    methods.setValue("topics", topics)
  }, [methods, topics])

  const handleSubmit = async (values: any) => {
    await setFilter({
      status: values.status,
      operator: values.operator,
      hasnotes: values.hasnotes,
      haslocation: values.haslocation,
      categories: values.categories,
      topics: values.topics,
      searchterm: values.searchterm,
    })
  }

  const handleFilterReset = async () => {
    methods.reset()
    await setFilter({ ...filterDefault })
  }

  // backend configurations: labels
  const labels = backendConfig.labels || defaultBackendConfig.labels

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
  const topicsOptions = topicsDefinition.length
    ? [
        ...topicsDefinition.map((t) => {
          return { value: String(t.id), label: t.title }
        }),
        { value: "0", label: `Ohne ${labels.topics?.sg || "Tag"}` },
      ]
    : []

  const categoriesOptions = categoryQuestionProps?.responses.map((r: TResponse) => {
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
                scope={"status"}
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
