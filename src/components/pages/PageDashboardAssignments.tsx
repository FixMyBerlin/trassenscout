import { useQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { SelectListbox } from "@/src/components/core/components/forms/SelectListbox"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { AssignmentsList } from "@/src/components/dashboard/AssignmentsList"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { useAssignedRecords } from "@/src/components/dashboard/useAssignedRecords"
import { useDashboardTabs } from "@/src/components/dashboard/useDashboardTabs"
import { TagFilterCombobox } from "@/src/components/tags/TagFilterCombobox"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { mergeDashboardSearch } from "@/src/shared/dashboard/mergeDashboardSearch"
import type { AssignmentsSearch } from "@/src/shared/dashboard/searchSchemas"
import {
  ASSIGNMENTS_DEFAULTS,
  ASSIGNMENTS_RESET,
  DASHBOARD_ALL_MONTHS,
  DASHBOARD_ALL_PROJECTS,
  dashboardFilterValues,
  hasAssignmentsFilter,
} from "@/src/shared/dashboard/searchSchemas"
import { taskDirectionOptions } from "@/src/shared/projectRecords/assignmentDirection"

const routeApi = getRouteApi("/_loggedInGeneral/dashboard/assignments/")

const statusOptions: { value: AssignmentsSearch["status"]; label: string }[] = [
  { value: "PENDING", label: "In Bearbeitung" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "all", label: "Alle Status" },
]

export function PageDashboardAssignments() {
  const tabs = useDashboardTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/dashboard/assignments/" })
  const { data: projects = [] } = useQuery(projectsWithGeometryWithMembershipRoleQueryOptions())
  const filter = dashboardFilterValues(search)
  const { records, isError, isPlaceholderData, tagOptions } = useAssignedRecords(
    filter.projectSlug,
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
            hasAdditionalFilters={hasAssignmentsFilter(search)}
            // One navigation, so the status and the project cannot undo each other.
            onReset={() =>
              void navigate({
                search: (prev) => ({
                  ...mergeDashboardSearch(prev, {
                    projectSlug: DASHBOARD_ALL_PROJECTS,
                    months: DASHBOARD_ALL_MONTHS,
                  }),
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
        onTagClick={(tag) => updateSearch({ tag })}
      />
    </>
  )
}
