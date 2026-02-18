import { getSurveyCategoryOptions } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getSurveyCategoryOptions"
import { backendConfig as defaultBackendConfig } from "@/src/app/beteiligung/_shared/backend-types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { linkStyles } from "@/src/core/components/links"
import { Prettify } from "@/src/core/types"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import getSurveyResponseTopicsByProject from "@/src/server/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Operator } from "@prisma/client"
import { clsx } from "clsx"
import { PropsWithoutRef, useEffect, useState } from "react"
import { z } from "zod"
import { DebugFilterForm } from "./DebugFilterForm"
import { LabeledInputRadioCheckbox } from "./form/LabeledInputRadioCheckbox"
import { FormElementWrapper } from "./form/LabeledInputRadioCheckboxWrapper"
import { useDefaultFilterValues } from "./useDefaultFilterValues"
import { useFilters } from "./useFilters.nuqs"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
  surveySlug: AllowedSurveySlugs
  additionalFilters: Prettify<
    Awaited<ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>>
  >["additionalFilterQuestionsWithResponseOptions"]
  operators: Prettify<Awaited<ReturnType<typeof getOperatorsWithCount>>["operators"]>
  topicsDefinition: Prettify<
    Awaited<ReturnType<typeof getSurveyResponseTopicsByProject>>["surveyResponseTopics"]
  >
}

export function EditableSurveyResponseFilterForm<S extends z.ZodType<any, any>>({
  surveySlug,
  operators,
  topicsDefinition,
  additionalFilters,
}: FormProps<S>) {
  const defaultFilters = useDefaultFilterValues(surveySlug)
  const { filter, setFilter } = useFilters()
  const [searchterm, setSearchterm] = useState("")

  // todo: how to set the default values for the form?
  useEffect(() => {
    setFilter(filter || defaultFilters)
  }, [])

  // backend configurations: status
  const backendConfig = getConfigBySurveySlug(surveySlug, "backend")
  const surveyResponseStatus = backendConfig.status

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

  const categoryOptions = getSurveyCategoryOptions(surveySlug)

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
    <nav className="rounded-lg bg-gray-100">
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
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </FormElementWrapper>
              <div className="flex shrink-0 flex-col gap-4">
                {!backendConfig.disableNote && (
                  <FormElementWrapper
                    label={labels.note?.sg || defaultBackendConfig.labels.note.sg}
                  >
                    {hasnotesOptions.map((item) => (
                      <LabeledInputRadioCheckbox
                        type="radio"
                        label={item.label}
                        value={item.value}
                        key={item.value}
                        name="hasnotes"
                        onChange={handleInputChange}
                        checked={filter?.hasnotes === item.value}
                      />
                    ))}
                  </FormElementWrapper>
                )}
                <FormElementWrapper
                  label={labels.location?.sg || defaultBackendConfig.labels.location.sg}
                >
                  {haslocationOptions.map((item) => (
                    <LabeledInputRadioCheckbox
                      type="radio"
                      label={item.label}
                      value={item.value}
                      key={item.value}
                      name="haslocation"
                      onChange={handleInputChange}
                      checked={filter?.haslocation === item.value}
                    />
                  ))}
                </FormElementWrapper>
              </div>
              {additionalFilters && Boolean(additionalFilters?.length) && filter && (
                <ul className="flex shrink flex-col gap-6">
                  {additionalFilters.map((addFilter) => (
                    <li key={addFilter.id}>
                      <FormElementWrapper label={addFilter.label}>
                        <select
                          onChange={handleSelectChange}
                          name={addFilter.value}
                          // @ts-ignore todo
                          value={filter[addFilter.value]}
                          className={
                            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
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
                {categoryOptions.map((item) => (
                  <LabeledInputRadioCheckbox
                    type="checkbox"
                    label={item.label}
                    value={item.value}
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
                    label={item.label}
                    value={item.value}
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
                      label={item.label}
                      value={item.value}
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
                    "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
                  }
                />
              </div>
              <button type="button" className="h-full">
                <MagnifyingGlassIcon className="h-9 w-9 rounded-md bg-blue-500 p-2 text-white hover:bg-blue-800" />
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
