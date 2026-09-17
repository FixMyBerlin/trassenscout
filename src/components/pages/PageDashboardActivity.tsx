import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { LogEntriesTable } from "@/src/components/admin/log-entries/LogEntriesTable"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderToolbarLink } from "@/src/components/core/components/PageHeader/PageHeaderToolbarLink"
import { Spinner } from "@/src/components/core/components/Spinner"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { useDashboardTabs } from "@/src/components/dashboard/useDashboardTabs"
import { logEntriesQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { mergeDashboardSearch } from "@/src/shared/dashboard/mergeDashboardSearch"
import { dashboardFilterValues } from "@/src/shared/dashboard/searchSchemas"
import { logEntriesExportHref } from "@/src/shared/logEntries/exportHref"

const routeApi = getRouteApi("/_loggedInGeneral/dashboard/activity/")

export function PageDashboardActivity() {
  const tabs = useDashboardTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/dashboard/activity/" })
  const { data: projects = [] } = useQuery(projectsWithGeometryWithMembershipRoleQueryOptions())

  return (
    <>
      <PageHeader
        title="Aktivitäten"
        titleVisuallyHidden
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbStep>Meine Projekte</BreadcrumbStep>
          </Breadcrumb>
        }
        info="Alle Änderungen in den Projekten, in denen Sie mitarbeiten – neueste zuerst."
        tabs={<TabsApp tabs={tabs} embedded />}
        filtersAction={
          <PageHeaderToolbarLink
            href={logEntriesExportHref(dashboardFilterValues(search))}
            label="Die angezeigten Änderungen als .csv herunterladen"
          >
            CSV
          </PageHeaderToolbarLink>
        }
        filters={
          <DashboardFilters
            projectSlug={search.projectSlug}
            months={search.months}
            projects={projects}
            showTimeRange
            onChange={(next) =>
              void navigate({
                search: (prev) => mergeDashboardSearch(prev, next),
                ...preserveScrollNavigateOptions,
              })
            }
          />
        }
      />
      <div className={pageContentPaddingClassName}>
        <ActivityList {...dashboardFilterValues(search)} />
      </div>
    </>
  )
}

function ActivityList({ projectSlug, months }: { projectSlug?: string; months?: number }) {
  const { data, isPlaceholderData } = useQuery({
    ...logEntriesQueryOptions({ projectSlug, months }),
    placeholderData: keepPreviousData,
  })

  if (!data) return <Spinner page />

  return (
    <div className={isPlaceholderData ? "opacity-50 transition-opacity" : undefined}>
      <LogEntriesTable
        entries={data.logEntries}
        isAdmin={data.isAdmin}
        showProject
        emptyText="Keine Änderungen für diese Auswahl."
      />
    </div>
  )
}
