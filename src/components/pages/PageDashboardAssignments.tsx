import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { SelectListbox } from "@/src/components/core/components/forms/SelectListbox"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { AssignedRecordsTable } from "@/src/components/dashboard/AssignedRecordsTable"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { useDashboardTabs } from "@/src/components/dashboard/useDashboardTabs"
import { myAssignedRecordsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { mergeDashboardSearch } from "@/src/shared/dashboard/mergeDashboardSearch"
import type { AssignmentsSearch } from "@/src/shared/dashboard/searchSchemas"
import {
  ASSIGNMENTS_DEFAULTS,
  DASHBOARD_ALL_MONTHS,
  DASHBOARD_ALL_PROJECTS,
  dashboardFilterValues,
} from "@/src/shared/dashboard/searchSchemas"

const routeApi = getRouteApi("/_loggedInGeneral/dashboard/assignments/")

const statusOptions: { value: AssignmentsSearch["status"]; label: string }[] = [
  { value: "PENDING", label: "In Bearbeitung" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "all", label: "Status: Alle" },
]

const directionOptions: { value: AssignmentsSearch["direction"]; label: string }[] = [
  { value: "all", label: "Alle Zuweisungen" },
  { value: "byMe", label: "Von mir zugewiesen" },
  { value: "toMe", label: "An mich zugewiesen" },
]

export function PageDashboardAssignments() {
  const tabs = useDashboardTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/dashboard/assignments/" })
  const { data: projects = [] } = useQuery(projectsWithGeometryWithMembershipRoleQueryOptions())
  const filter = dashboardFilterValues(search)

  const updateSearch = (updates: Partial<AssignmentsSearch>) =>
    void navigate({
      search: (prev) => ({ ...prev, ...updates }),
      ...preserveScrollNavigateOptions,
    })

  return (
    <>
      <PageHeader
        title="Aufgaben"
        titleVisuallyHidden
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbStep>Meine Projekte</BreadcrumbStep>
          </Breadcrumb>
        }
        info="Protokolleinträge, die Ihnen zugewiesen sind oder die Sie zugewiesen haben."
        tabs={<TabsApp tabs={tabs} embedded />}
        filters={
          <DashboardFilters
            projectSlug={search.projectSlug}
            months={search.months}
            projects={projects}
            onChange={(next) =>
              void navigate({
                search: (prev) => mergeDashboardSearch(prev, next),
                ...preserveScrollNavigateOptions,
              })
            }
            hasAdditionalFilters={
              search.status !== ASSIGNMENTS_DEFAULTS.status ||
              search.direction !== ASSIGNMENTS_DEFAULTS.direction
            }
            // One navigation, so the status and the project cannot undo each other.
            onReset={() =>
              void navigate({
                search: (prev) => ({
                  ...mergeDashboardSearch(prev, {
                    projectSlug: DASHBOARD_ALL_PROJECTS,
                    months: DASHBOARD_ALL_MONTHS,
                  }),
                  ...ASSIGNMENTS_DEFAULTS,
                }),
                ...preserveScrollNavigateOptions,
              })
            }
          >
            <SelectListbox
              className="w-48"
              value={search.status}
              options={statusOptions}
              onChange={(next) => updateSearch({ status: next ?? "all" })}
            />
            <SelectListbox
              className="w-56"
              value={search.direction}
              options={directionOptions}
              onChange={(next) => updateSearch({ direction: next ?? "all" })}
            />
          </DashboardFilters>
        }
      />
      <AssignmentsList
        projectSlug={filter.projectSlug}
        status={search.status}
        direction={search.direction}
      />
    </>
  )
}

/** Holds its rows while the next filter loads — see `PageAdminLogEntries`. */
function AssignmentsList({
  projectSlug,
  status,
  direction,
}: {
  projectSlug?: string
  status: AssignmentsSearch["status"]
  direction: AssignmentsSearch["direction"]
}) {
  const { data: records, isPlaceholderData } = useQuery({
    ...myAssignedRecordsQueryOptions({
      projectSlug,
      direction,
      editingState: status === "all" ? undefined : status,
    }),
    placeholderData: keepPreviousData,
  })

  if (!records) return <Spinner page />

  return (
    <div className={isPlaceholderData ? "opacity-50 transition-opacity" : undefined}>
      <AssignedRecordsTable records={records} />
    </div>
  )
}
