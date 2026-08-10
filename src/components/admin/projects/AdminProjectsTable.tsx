import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MapIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import {
  adminTableBodyClassName,
  adminTableCellClassName,
  adminTableClassName,
  adminTableExternalLinkClassName,
  adminTableHeaderClassName,
  adminTableHeadRowClassName,
  adminTableRowClassName,
} from "@/src/components/admin/adminListClasses"
import {
  AdminTableExternalLink,
  AdminTableFeatureCheckbox,
} from "@/src/components/admin/AdminTableActions"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { Link } from "@/src/components/core/components/links/Link"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { longTitle } from "@/src/components/core/components/text/titles"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { updateProjectsFeatureFlagFn } from "@/src/server/projects/projects.functions"
import type { ProjectFeatureFlagKey } from "@/src/server/projects/projects.inputSchemas"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import type { AdminProjectWithCounts } from "@/src/server/projects/types"

type Props = {
  projects: AdminProjectWithCounts[]
  isFiltering: boolean
  hasActiveFilter: boolean
}

const formatPaCount = (count: number) => `${count} ${count === 1 ? "PA" : "PAs"}`

const formatSubsubsectionCount = (count: number) =>
  `${count} ${count === 1 ? "Teilabschnitt" : "Teilabschnitte"}`

type ProjectFeatureColumn = {
  key: ProjectFeatureFlagKey
  header: string
  icon: React.ReactNode
  label: (enabled: boolean) => string
}

const projectFeatureColumns: ProjectFeatureColumn[] = [
  {
    key: "exportEnabled",
    header: "Export-API",
    icon: <ArrowDownTrayIcon className="size-4" aria-hidden />,
    label: (enabled) => (enabled ? "Export-API ausschalten" : "Export-API einschalten"),
  },
  {
    key: "aiEnabled",
    header: "KI",
    icon: <SparklesIcon className="size-4" aria-hidden />,
    label: (enabled) =>
      enabled
        ? "KI-Features ausschalten (E-Mail-Protokoll, KI-Verarbeitung)"
        : "KI-Features einschalten (E-Mail-Protokoll, KI-Verarbeitung)",
  },
  {
    key: "landAcquisitionModuleEnabled",
    header: "Grund\u00ADerwerb",
    icon: <MapIcon className="size-4" aria-hidden />,
    label: (enabled) =>
      enabled ? "Grunderwerb-Modul ausschalten" : "Grunderwerb-Modul einschalten",
  },
  {
    key: "showLogEntries",
    header: "Log-Einträge",
    icon: <DocumentTextIcon className="size-4" aria-hidden />,
    label: (enabled) =>
      enabled ? "Log-Einträge für Editoren ausschalten" : "Log-Einträge für Editoren einschalten",
  },
  {
    key: "evaluationsEnabled",
    header: "Auswertungen",
    icon: <ChartBarIcon className="size-4" aria-hidden />,
    label: (enabled) => (enabled ? "Auswertungen ausschalten" : "Auswertungen einschalten"),
  },
]

export const AdminProjectsTable = ({ projects, isFiltering, hasActiveFilter }: Props) => {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const updateMutation = useMutation({ mutationFn: updateProjectsFeatureFlagFn })
  const isPending = updateMutation.isPending

  const handleUpdate = async (
    projectSlugs: string[],
    key: ProjectFeatureFlagKey,
    enabled: boolean,
  ) => {
    setFormError(null)
    try {
      await updateMutation.mutateAsync({ data: { projectSlugs, key, enabled } })
      await queryClient.invalidateQueries({
        queryKey: adminProjectsWithCountsQueryOptions().queryKey,
      })
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : String(error))
    }
  }

  if (!projects.length) {
    return (
      <p className="px-4 text-sm text-gray-600">
        {hasActiveFilter
          ? "Keine Projekte für diese Suche gefunden."
          : "Noch keine Projekte vorhanden."}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <TableWrapper
        withTopBorder
        className={twMerge(
          "transition-opacity duration-150",
          isFiltering || isPending ? "opacity-60" : "",
        )}
      >
        <table className={twMerge(adminTableClassName, "w-max min-w-full")}>
          <thead>
            <tr className={adminTableHeadRowClassName}>
              <th className={adminTableHeaderClassName}>Projekt</th>
              <th className={adminTableHeaderClassName}>PA / TA</th>
              {projectFeatureColumns.map((column, columnIndex) => {
                const allEnabled = projects.every((project) => project[column.key])
                const someEnabled = projects.some((project) => project[column.key])
                const scope = hasActiveFilter ? "alle gefilterten Projekte" : "alle Projekte"
                const isLastColumn = columnIndex === projectFeatureColumns.length - 1
                return (
                  <th key={column.key} className={adminTableHeaderClassName}>
                    <div className="flex min-w-18 flex-col gap-1 leading-snug">
                      {column.header}
                      <AdminTableFeatureCheckbox
                        checked={allEnabled}
                        indeterminate={someEnabled && !allEnabled}
                        disabled={isPending}
                        tooltipPlacement={isLastColumn ? "bottom-end" : "bottom"}
                        label={`${column.header} für ${scope} ${allEnabled ? "ausschalten" : "einschalten"}`}
                        onChange={() =>
                          void handleUpdate(
                            projects.map((project) => project.slug),
                            column.key,
                            !allEnabled,
                          )
                        }
                      />
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className={adminTableBodyClassName}>
            {projects.map((project) => (
              <tr key={project.id} className={adminTableRowClassName}>
                <td className={adminTableCellClassName}>
                  <Tooltip content={longTitle(project.slug)}>
                    <span className="inline-flex">
                      <AdminTableExternalLink href={`/${project.slug}`}>
                        {shortTitle(project.slug)}
                      </AdminTableExternalLink>
                    </span>
                  </Tooltip>
                </td>
                <td className={adminTableCellClassName}>
                  <div className="flex flex-col gap-0.5 leading-tight">
                    <Link
                      to={`/admin/projects/${project.slug}/subsections`}
                      classNameOverwrites={adminTableExternalLinkClassName}
                    >
                      {formatPaCount(project.subsectionCount)}
                    </Link>
                    <span
                      className={project.subsubsectionCount === 0 ? "text-gray-400" : undefined}
                    >
                      {formatSubsubsectionCount(project.subsubsectionCount)}
                    </span>
                  </div>
                </td>
                {projectFeatureColumns.map((column) => (
                  <td key={column.key} className={adminTableCellClassName}>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      {column.icon}
                      <AdminTableFeatureCheckbox
                        checked={project[column.key]}
                        disabled={isPending}
                        label={column.label(project[column.key])}
                        onChange={() =>
                          void handleUpdate([project.slug], column.key, !project[column.key])
                        }
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
      {formError && (
        <div role="alert" className="mx-4 rounded-sm bg-red-50 px-2 py-1 text-red-800">
          <span className="font-mono text-sm leading-tight">{translateServerError(formError)}</span>
        </div>
      )}
    </div>
  )
}
