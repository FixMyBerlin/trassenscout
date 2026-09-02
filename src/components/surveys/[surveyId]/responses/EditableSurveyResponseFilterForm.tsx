import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { type JSX, type PropsWithoutRef } from "react"
import { twJoin } from "tailwind-merge"
import { backendConfig as defaultBackendConfig } from "@/src/components/beteiligung/shared/backend-types"
import { type AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { ComboboxMultiBase } from "@/src/components/core/components/forms/ComboboxMultiBase"
import { ComboboxSingleBase } from "@/src/components/core/components/forms/ComboboxSingleBase"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeaderSearchFilter } from "@/src/components/core/components/PageHeader/PageHeaderSearchFilter"
import { type Prettify } from "@/src/components/core/types"
import type { FeedbackSurveyResponsesResult } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { DebugFilterForm } from "./DebugFilterForm"
import { useDefaultFilterValues } from "./useDefaultFilterValues"
import { useSurveyResponseFilters as useFilters } from "./useSurveyResponseFilters"

type AdditionalFilters = Prettify<
  NonNullable<FeedbackSurveyResponsesResult["additionalFilterQuestionsWithResponseOptions"]>
>

type FormProps = Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> & {
  surveySlug: AllowedSurveySlugs
  additionalFilters: AdditionalFilters
}

export function EditableSurveyResponseFilterForm({
  surveySlug,
  additionalFilters = [],
}: FormProps) {
  const defaultFilters = useDefaultFilterValues(surveySlug)
  const { filter, setFilter } = useFilters()

  const effectiveFilter = filter ?? defaultFilters

  const backendConfig = getConfigBySurveySlug(surveySlug, "backend")
  const surveyResponseStatus = backendConfig.status
  const labels = backendConfig.labels || defaultBackendConfig.labels
  const hasAdvancedFilters = additionalFilters.length > 0

  const statusOptions = surveyResponseStatus.map(({ value, label }) => ({ value, label }))

  const getAdditionalFilterValue = (name: string) => {
    const value = (effectiveFilter as Record<string, unknown>)[name]
    return typeof value === "string" ? value : "ALL"
  }

  const handleStandardFilterReset = async () => {
    await setFilter((prevValues) => ({
      ...(prevValues ?? defaultFilters),
      searchterm: "",
      status: defaultFilters.status,
    }))
  }

  const handleAdvancedFilterReset = async () => {
    await setFilter((prevValues) => {
      const current = prevValues ?? defaultFilters
      const next = { ...current } as Record<string, unknown>
      const defaultFilterLookup = defaultFilters as Record<string, unknown>

      additionalFilters.forEach((advancedFilter) => {
        next[advancedFilter.value] = defaultFilterLookup[advancedFilter.value] ?? "ALL"
      })

      return next as typeof current
    })
  }

  const handleStatusChange = async (value: string[]) => {
    await setFilter((prevValues) => ({
      ...(prevValues ?? defaultFilters),
      status: value,
    }))
  }

  const handleAdditionalFilterChange = async (name: string, value: string | null) => {
    await setFilter((prevValues) => ({
      ...(prevValues ?? defaultFilters),
      [name]: value ?? "ALL",
    }))
  }

  const handleSearchtermChange = async (value: string) => {
    await setFilter((prevValues) => ({
      ...(prevValues ?? defaultFilters),
      searchterm: value,
    }))
  }

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <DebugFilterForm filter={filter} />
      <div className={twJoin(pageContentPaddingClassName, "relative z-10 py-5")}>
        <PageHeaderSearchFilter
          value={effectiveFilter.searchterm}
          onChange={(searchterm) => void handleSearchtermChange(searchterm)}
          onReset={() => void handleStandardFilterReset()}
          placeholder='Beiträge nach Suchwort filtern oder nach "tag:Name" für Tag suchen'
        >
          <div className="w-[300px] max-w-full">
            <ComboboxMultiBase
              value={effectiveFilter.status}
              onChange={(value) => void handleStatusChange(value)}
              items={statusOptions}
              placeholder="Status suchen"
              buttonSrLabel={labels.status?.sg || defaultBackendConfig.labels.status.sg}
              allSelectedLabel="Alle Status"
              selectedCountLabel={(count) => `${count} Status ausgewählt`}
            />
          </div>
        </PageHeaderSearchFilter>
      </div>

      {hasAdvancedFilters && (
        // Below the filter bar (10), above the unpositioned table.
        <Disclosure as="div" className="relative z-[5] border-t border-gray-200 bg-gray-50">
          <DisclosureButton
            className={twJoin(
              pageContentPaddingClassName,
              "group flex w-full cursor-pointer items-center gap-2 py-4 text-left text-gray-700 hover:bg-gray-100",
            )}
          >
            <ChevronRightIcon
              className="size-5 shrink-0 text-gray-500 transition-transform duration-200 group-data-open:rotate-90 motion-reduce:transition-none"
              aria-hidden="true"
            />
            Erweiterte Filter
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="grid grid-rows-[1fr] overflow-visible opacity-100 transition-[grid-template-rows,opacity,transform] duration-200 ease-out data-closed:-translate-y-1 data-closed:grid-rows-[0fr] data-closed:overflow-hidden data-closed:opacity-0 motion-reduce:transition-none"
          >
            <div className="min-h-0">
              <div className={twJoin(pageContentPaddingClassName, "flex flex-wrap gap-4 pb-5")}>
                {additionalFilters.map((advancedFilter) => (
                  <div key={advancedFilter.id} className="min-w-[260px] flex-1 md:max-w-sm">
                    <ComboboxSingleBase
                      value={getAdditionalFilterValue(advancedFilter.value)}
                      onChange={(value) =>
                        void handleAdditionalFilterChange(advancedFilter.value, value)
                      }
                      items={advancedFilter.options.map(({ value, label }) => ({
                        value,
                        label,
                        triggerText:
                          value === "ALL" ? `Nach ${advancedFilter.label} filtern` : undefined,
                      }))}
                      placeholder={`${advancedFilter.label} suchen`}
                      buttonSrLabel={advancedFilter.label}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className={twJoin(linkStyles, "flex items-center gap-2 self-center")}
                  onClick={() => void handleAdvancedFilterReset()}
                >
                  <XMarkIcon className="size-4" />
                  <span>Filter zurücksetzen</span>
                </button>
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>
      )}
    </nav>
  )
}
