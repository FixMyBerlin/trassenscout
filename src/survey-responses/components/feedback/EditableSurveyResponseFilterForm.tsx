import { linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { Prettify } from "@/src/core/types"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import { TResponse, TSingleOrMultiResponseProps } from "@/src/survey-public/components/types"
import { backendConfig as defaultBackendConfig } from "@/src/survey-public/utils/backend-config-defaults"
import {
  getBackendConfigBySurveySlug,
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import { getQuestionsAsArray } from "@/src/survey-public/utils/getQuestionsAsArray"
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { MagnifyingGlassCircleIcon } from "@heroicons/react/20/solid"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Operator } from "@prisma/client"
import clsx from "clsx"
import { PropsWithoutRef, useEffect, useState } from "react"
import { z } from "zod"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "../../queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { DebugFilterForm } from "./DebugFilterForm"
import { LabeledInputRadioCheckbox } from "./form/LabeledInputRadioCheckbox"
import { FormElementWrapper } from "./form/LabeledInputRadioCheckboxWrapper"
import { useDefaultFilterValues } from "./useDefaultFilterValues"
import { useFilters } from "./useFilters.nuqs"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
  additionalFilters: Prettify<
    Awaited<ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>>
  >["additionalFilterQuestionsWithResponseOptions"]
  operators: Prettify<Awaited<ReturnType<typeof getOperatorsWithCount>>["operators"]>
  topicsDefinition: Prettify<
    Awaited<ReturnType<typeof getSurveyResponseTopicsByProject>>["surveyResponseTopics"]
  >
}

export function EditableSurveyResponseFilterForm<S extends z.ZodType<any, any>>({
  operators,
  topicsDefinition,
  additionalFilters,
}: FormProps<S>) {
  const surveyId = useParam("surveyId", "string")
  const projectSlug = useProjectSlug()
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })
  const defaultFilters = useDefaultFilterValues()
  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)

  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const feedbackQuestions = getQuestionsAsArray({
    definition: feedbackDefinition,
    surveyPart: "feedback",
  })

  const categoryQuestionProps = feedbackQuestions.find(
    (q) => q.id === evaluationRefs["feedback-category"],
  )!.props as TSingleOrMultiResponseProps

  // backend configurations: status
  const backendConfig = getBackendConfigBySurveySlug(survey.slug)
  const surveyResponseStatus = backendConfig.status

  const { filter, setFilter } = useFilters()
  const [searchterm, setSearchterm] = useState("")

  // todo: how to set the default values for the form?
  useEffect(() => {
    setFilter(filter || defaultFilters)
  }, [])

  const handleFilterReset = async () => {
    setSearchterm("")
    await setFilter(defaultFilters)
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

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    if (type === "checkbox") {
      // @ts-expect-error todo
      await setFilter((prevValues) => ({
        ...prevValues,
        [name]: checked
          ? // @ts-expect-error todo
            [...prevValues[name], value]
          : // @ts-expect-error todo
            prevValues[name].filter((item) => item !== value),
      }))
    }
    if (type === "radio") {
      // @ts-expect-error todo
      setFilter((prevValues) => ({
        ...prevValues,
        [name]: value,
      }))
    }
  }

  const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target
    // @ts-expect-error todo
    await setFilter((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleSearchtermInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSearchterm(value)
  }

  const handleSearchtermInputBlur = async (event: any) => {
    const { name, value } = event.target
    // @ts-expect-error todo
    await setFilter((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // @ts-expect-error todo
    await setFilter((prevValues) => ({
      ...prevValues,
      searchterm,
    }))
    console.log("handleSubmit", event)
    console.log("handleSubmit", filter)
  }
  return (
    <nav className="rounded-xl border border-gray-300">
      <details open>
        <summary className="cursor-pointer rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-50">
          Filter
        </summary>
        <form
          className="flex flex-col items-start justify-start gap-6 rounded-b-xl px-4 py-2"
          onSubmit={handleSubmit}
        >
          <DebugFilterForm filter={filter} />
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <FormElementWrapper
                label={labels.status?.sg || defaultBackendConfig.labels.status.sg}
              >
                {statusOptions.map((item) => (
                  <LabeledInputRadioCheckbox
                    type="checkbox"
                    name="status"
                    key={item.value}
                    checked={filter?.status.includes(item.value)}
                    onChange={handleInputChange}
                    item={item}
                  />
                ))}
              </FormElementWrapper>
              <div className="flex flex-shrink-0 flex-col gap-4">
                <FormElementWrapper label={labels.note?.sg || defaultBackendConfig.labels.note.sg}>
                  {hasnotesOptions.map((item) => (
                    <LabeledInputRadioCheckbox
                      type="radio"
                      item={item}
                      key={item.value}
                      name="hasnotes"
                      onChange={handleInputChange}
                      checked={filter?.hasnotes === item.value}
                    />
                  ))}
                </FormElementWrapper>
                <FormElementWrapper
                  label={labels.location?.sg || defaultBackendConfig.labels.location.sg}
                >
                  {haslocationOptions.map((item) => (
                    <LabeledInputRadioCheckbox
                      type="radio"
                      item={item}
                      key={item.value}
                      name="haslocation"
                      onChange={handleInputChange}
                      checked={filter?.haslocation === item.value}
                    />
                  ))}
                </FormElementWrapper>
              </div>
              {additionalFilters && Boolean(additionalFilters?.length) && filter && (
                <ul className="flex flex-shrink flex-col gap-4">
                  {additionalFilters.map((addFilter) => (
                    <li key={addFilter.id}>
                      <FormElementWrapper label={addFilter.label}>
                        <select
                          onChange={handleSelectChange}
                          name={addFilter.value}
                          // @ts-ignore todo
                          value={filter[addFilter.value]}
                          className={
                            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          }
                        >
                          {addFilter.options.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </FormElementWrapper>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col gap-12 sm:flex-row">
              <FormElementWrapper
                label={labels.category?.sg || defaultBackendConfig.labels.category.sg}
              >
                {categoriesOptions.map((item) => (
                  <LabeledInputRadioCheckbox
                    type="checkbox"
                    item={item}
                    key={item.value}
                    name="categories"
                    onChange={handleInputChange}
                    checked={filter?.categories.includes(item.value)}
                  />
                ))}
              </FormElementWrapper>
              <FormElementWrapper
                label={labels.operator?.sg || defaultBackendConfig.labels.operator.sg}
              >
                {operatorOptions.map((item) => (
                  <LabeledInputRadioCheckbox
                    type="radio"
                    item={item}
                    key={item.value}
                    name="operator"
                    onChange={handleInputChange}
                    checked={filter?.operator === item.value}
                  />
                ))}
              </FormElementWrapper>
            </div>
            {!!topicsOptions.length && (
              <FormElementWrapper
                label={labels.topics?.pl || defaultBackendConfig.labels.topics.pl}
              >
                <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
                  {topicsOptions.map((item) => (
                    <LabeledInputRadioCheckbox
                      type="checkbox"
                      name="topics"
                      key={item.value}
                      checked={filter?.topics.includes(item.value)}
                      onChange={handleInputChange}
                      item={item}
                    />
                  ))}
                </div>
              </FormElementWrapper>
            )}
            <div className="flex items-end gap-4">
              <div className="w-[300px]">
                <p className="mb-3 font-semibold">Freitextsuche</p>
                <input
                  onChange={handleSearchtermInputChange}
                  type="text"
                  value={searchterm}
                  onBlur={handleSearchtermInputBlur}
                  name="searchterm"
                  placeholder="Beiträge nach Suchwort filtern"
                  className={
                    "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  }
                />
              </div>
              <button type="button" className="h-full pb-2">
                <MagnifyingGlassCircleIcon className="h-6 w-6 text-blue-500 hover:text-blue-800" />
              </button>
            </div>
          </div>
        </form>
        <button
          type="button"
          className={clsx(linkStyles, "mt-4 flex items-center gap-2 px-4 pb-2")}
          onClick={handleFilterReset}
        >
          <XMarkIcon className="h-4 w-4" />
          <span>Alle Filter zurücksetzen</span>
        </button>
      </details>
    </nav>
  )
}
