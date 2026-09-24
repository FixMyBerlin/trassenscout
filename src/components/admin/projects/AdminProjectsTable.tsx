import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  CommandLineIcon,
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
import { McpModeEnum } from "@/src/prisma/generated/browser"
import { effectiveMcpMode } from "@/src/server/mcp/effectiveMcpMode"
import {
  updateProjectMcpModeFn,
  updateProjectsFeatureFlagFn,
} from "@/src/server/projects/projects.functions"
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
  bulkToggle?: boolean
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

const mcpModeOptions = [
  { value: McpModeEnum.DISABLED, label: "Aus" },
  { value: McpModeEnum.DRAFT, label: "Entwürfe" },
  { value: McpModeEnum.DIRECT, label: "Direkt" },
] as const

function storedMcp(project: AdminProjectWithCounts) {
  return {
    mcpMode: project.mcpMode,
    mcpDirectUntil: project.mcpDirectUntil ? new Date(project.mcpDirectUntil) : null,
  }
}

function formatMcpDirectUntil(date: Date) {
  return date.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })
}

function mcpModeHint(project: AdminProjectWithCounts, now: Date) {
  const stored = storedMcp(project)
  const effective = effectiveMcpMode(stored, now)
  if (effective === McpModeEnum.DIRECT && stored.mcpDirectUntil) {
    return `Direkt bis ${formatMcpDirectUntil(stored.mcpDirectUntil)}, danach wieder Entwürfe.`
  }
  if (stored.mcpMode === McpModeEnum.DIRECT) {
    return "Direkt-Fenster abgelaufen. Wirksam sind Entwürfe. Direkt erneut einschalten, um 24 Stunden zu öffnen."
  }
  if (effective === McpModeEnum.DRAFT) {
    return "Änderungen werden als Entwurf gespeichert."
  }
  return "MCP ist aus."
}

export const AdminProjectsTable = ({ projects, isFiltering, hasActiveFilter }: Props) => {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const updateMutation = useMutation({ mutationFn: updateProjectsFeatureFlagFn })
  const mcpModeMutation = useMutation({ mutationFn: updateProjectMcpModeFn })
  const isPending = updateMutation.isPending || mcpModeMutation.isPending

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

  const handleMcpMode = async (projectSlug: string, mcpMode: McpModeEnum) => {
    setFormError(null)
    try {
      await mcpModeMutation.mutateAsync({ data: { projectSlug, mcpMode } })
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
                const showBulkToggle = column.bulkToggle !== false
                return (
                  <th key={column.key} className={adminTableHeaderClassName}>
                    <div className="flex min-w-18 flex-col gap-1 leading-snug">
                      {column.header}
                      {showBulkToggle && (
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
                      )}
                    </div>
                  </th>
                )
              })}
              <th className={adminTableHeaderClassName}>
                <div className="flex min-w-36 flex-col gap-1 leading-snug">MCP</div>
              </th>
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
                <td className={adminTableCellClassName}>
                  <div className="flex items-start gap-1.5 text-gray-500">
                    <CommandLineIcon className="mt-1 size-4 shrink-0" aria-hidden />
                    <div className="flex min-w-36 flex-col gap-1">
                      <select
                        aria-label={`MCP-Modus für ${shortTitle(project.slug)}`}
                        className="rounded-sm border border-gray-300 bg-white px-1 py-0.5 text-sm text-gray-900"
                        disabled={isPending}
                        value={effectiveMcpMode(storedMcp(project), new Date())}
                        onChange={(event) =>
                          void handleMcpMode(project.slug, event.target.value as McpModeEnum)
                        }
                      >
                        {mcpModeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs leading-tight text-gray-500">
                        {mcpModeHint(project, new Date())}
                      </span>
                    </div>
                  </div>
                </td>
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
