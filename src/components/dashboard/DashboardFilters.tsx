import { XMarkIcon } from "@heroicons/react/20/solid"
import type { ReactNode } from "react"
import { twJoin } from "tailwind-merge"
import { ComboboxSingleBase } from "@/src/components/core/components/forms/ComboboxSingleBase"
import { SelectListbox } from "@/src/components/core/components/forms/SelectListbox"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { shortTitle } from "@/src/components/core/components/text/titles"
import {
  DASHBOARD_ALL_MONTHS,
  DASHBOARD_ALL_PROJECTS,
  type DashboardSearch,
} from "@/src/shared/dashboard/searchSchemas"

type Props = DashboardSearch & {
  projects: { slug: string }[]
  onChange: (value: DashboardSearch) => void
  showTimeRange?: boolean
  children?: ReactNode
}

const monthOptions = [
  { value: 3, label: "Letzte 3 Monate" },
  { value: 6, label: "Letzte 6 Monate" },
  { value: 12, label: "Letzte 12 Monate" },
  { value: DASHBOARD_ALL_MONTHS, label: "Gesamter Zeitraum" },
]

export const DashboardFilters = ({
  projectSlug,
  months,
  projects,
  onChange,
  showTimeRange = false,
  children,
}: Props) => {
  const hasFilter = projectSlug !== DASHBOARD_ALL_PROJECTS || months !== DASHBOARD_ALL_MONTHS

  // Same shape as the project switch in the header.
  const projectItems = [
    {
      value: DASHBOARD_ALL_PROJECTS,
      searchText: "Alle Projekte",
      label: <strong>Alle Projekte</strong>,
    },
    ...projects
      .map((project) => ({
        value: project.slug,
        searchText: shortTitle(project.slug),
        label: shortTitle(project.slug),
      }))
      .sort((a, b) => a.searchText.localeCompare(b.searchText)),
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[450px] max-w-full">
        <ComboboxSingleBase
          value={projectSlug}
          onChange={(value) => onChange({ projectSlug: value ?? DASHBOARD_ALL_PROJECTS, months })}
          items={projectItems}
          emptyLabel="Nach Projekt filtern"
          placeholder="Nach Projekt filtern"
          buttonSrLabel="Projekt filtern"
        />
      </div>

      {showTimeRange ? (
        <SelectListbox
          className="w-56"
          value={months}
          options={monthOptions}
          placeholder="Zeitraum"
          onChange={(next) => onChange({ projectSlug, months: next ?? DASHBOARD_ALL_MONTHS })}
        />
      ) : null}

      {hasFilter ? (
        <button
          type="button"
          className={twJoin(linkStyles, "flex items-center gap-2")}
          onClick={() =>
            onChange({ projectSlug: DASHBOARD_ALL_PROJECTS, months: DASHBOARD_ALL_MONTHS })
          }
        >
          <XMarkIcon className="size-4" />
          <span>Filter zurücksetzen</span>
        </button>
      ) : null}

      {children}
    </div>
  )
}
