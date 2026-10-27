import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { SelectListbox } from "@/src/components/core/components/forms/SelectListbox"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { AssignmentsList } from "@/src/components/dashboard/AssignmentsList"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { useAssignedRecords } from "@/src/components/dashboard/useAssignedRecords"
import { useProjectPageTabs } from "@/src/components/dashboard/useProjectPageTabs"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { TagFilterCombobox } from "@/src/components/tags/TagFilterCombobox"
import type { AssignmentsSearch } from "@/src/shared/dashboard/searchSchemas"
import {
  ASSIGNMENTS_DEFAULTS,
  ASSIGNMENTS_RESET,
  DASHBOARD_ALL_MONTHS,
  DASHBOARD_ALL_PROJECTS,
  hasAssignmentsFilter,
} from "@/src/shared/dashboard/searchSchemas"
import { taskDirectionOptions } from "@/src/shared/projectRecords/assignmentDirection"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/assignments/")

const statusOptions: { value: AssignmentsSearch["status"]; label: string }[] = [
  { value: "PENDING", label: "In Bearbeitung" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "all", label: "Status: Alle" },
]

export function PageProjectAssignments() {
  const { projectSlug } = routeApi.useParams()
  const tabs = useProjectPageTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/$projectSlug/assignments/" })
  const { records, isError, isPlaceholderData, tagOptions } = useAssignedRecords(
    projectSlug,
    search,
  )

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
            hasAdditionalFilters={hasAssignmentsFilter(search)}
            onChange={() => {}}
            onReset={() =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  ...ASSIGNMENTS_RESET,
                }),
                ...preserveScrollNavigateOptions,
              })
            }
          >
            <TagFilterCombobox
              tags={tagOptions}
              value={search.tag}
              onChange={(tag) => updateSearch({ tag })}
            />
            <SelectListbox
              className="w-48"
              value={search.status}
              options={statusOptions}
              onChange={(next) => updateSearch({ status: next ?? "all" })}
            />
            <SelectListbox
              className="w-56"
              value={search.direction}
              options={taskDirectionOptions}
              onChange={(next) =>
                updateSearch({ direction: next ?? ASSIGNMENTS_DEFAULTS.direction })
              }
            />
          </DashboardFilters>
        }
      />
      <AssignmentsList
        records={records}
        isError={isError}
        isPlaceholderData={isPlaceholderData}
        showProject={false}
        onTagClick={(tag) => updateSearch({ tag })}
      />
    </>
  )
}
