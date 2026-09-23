import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { SelectListbox } from "@/src/components/core/components/forms/SelectListbox"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { AssignedRecordsTable } from "@/src/components/dashboard/AssignedRecordsTable"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { useProjectPageTabs } from "@/src/components/dashboard/useProjectPageTabs"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { myAssignedRecordsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { AssignmentsSearch } from "@/src/shared/dashboard/searchSchemas"
import {
  ASSIGNMENTS_DEFAULTS,
  DASHBOARD_ALL_MONTHS,
  DASHBOARD_ALL_PROJECTS,
} from "@/src/shared/dashboard/searchSchemas"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/assignments/")

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

export function PageProjectAssignments() {
  const { projectSlug } = routeApi.useParams()
  const tabs = useProjectPageTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/$projectSlug/assignments/" })

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
        breadcrumb={<ProjectPageBreadcrumb />}
        info="Protokolleinträge, die Ihnen zugewiesen sind oder die Sie zugewiesen haben."
        tabs={<TabsApp tabs={tabs} embedded />}
        filters={
          <DashboardFilters
            projectSlug={DASHBOARD_ALL_PROJECTS}
            months={DASHBOARD_ALL_MONTHS}
            projects={[]}
            showProjectFilter={false}
            hasAdditionalFilters={
              search.status !== ASSIGNMENTS_DEFAULTS.status ||
              search.direction !== ASSIGNMENTS_DEFAULTS.direction
            }
            onChange={() => {}}
            onReset={() =>
              void navigate({
                search: (prev) => ({
                  ...prev,
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
        projectSlug={projectSlug}
        status={search.status}
        direction={search.direction}
      />
    </>
  )
}

function AssignmentsList({
  projectSlug,
  status,
  direction,
}: {
  projectSlug: string
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
      <AssignedRecordsTable records={records} showProject={false} />
    </div>
  )
}
